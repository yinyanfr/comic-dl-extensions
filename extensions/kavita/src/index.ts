import type {
  ConfigurableSourceExtension,
  OptionValues,
} from "../../source-options.js";
import type {
  Chapter,
  Page,
  SourceExtension,
  SourceExtensionApi,
} from "comic-dl/extension";
import { extname } from "node:path/posix";

interface SeriesDto {
  id: number;
  libraryId: number;
  name: string | null;
  localizedName: string | null;
}

interface ChapterDto {
  id: number;
  title: string | null;
  titleName: string | null;
  range: string | null;
  sortOrder: number;
}

interface VolumeDto {
  seriesId: number;
  chapters: ChapterDto[] | null;
}

interface ChapterInfo {
  seriesId: number;
  libraryId: number;
  seriesFormat: number;
  title: string | null;
  chapterTitle: string | null;
  chapterNumber: string | null;
  pages: number;
  pageDimensions: { pageNumber: number; fileName: string | null }[] | null;
}

interface InputIds {
  id: number;
  libraryId?: number;
  seriesId?: number;
}

const pageSize = 20;
const seriesPath = /^library\/(\d+)\/series\/(\d+)\/?$/;
const chapterPath =
  /^library\/(\d+)\/series\/(\d+)\/(?:chapter|manga|pdf)\/(\d+)(?:\/list\/\d+)?\/?$/;
const imageTypes: ReadonlyMap<string, Page["extension"]> = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
]);

function isId(value: number) {
  return Number.isInteger(value) && value > 0 && value <= 2_147_483_647;
}

function serverUrl(input = process.env.COMIC_DL_KAVITA_URL ?? "") {
  const url = URL.parse(input);
  if (
    !url ||
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    return;
  }
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  return url;
}

function linkIds(
  url: URL,
  base: URL,
  kind: "series" | "chapter",
): InputIds | undefined {
  if (
    url.origin !== base.origin ||
    url.username ||
    url.password ||
    !url.pathname.startsWith(base.pathname)
  ) {
    return;
  }
  const path = url.pathname.slice(base.pathname.length);
  const match = (kind === "series" ? seriesPath : chapterPath).exec(path);
  if (match && match.slice(1).every((id) => isId(Number(id)))) {
    const [, libraryId, seriesId, chapterId] = match;
    return {
      id: Number(chapterId ?? seriesId),
      libraryId: Number(libraryId),
      seriesId: Number(seriesId),
    };
  }
}

function inputIds(
  input: string,
  base: URL,
  kind: "series" | "chapter",
): InputIds {
  if (/^\d+$/.test(input) && isId(Number(input))) {
    return { id: Number(input) };
  }
  const url = URL.parse(input);
  const ids = url && linkIds(url, base, kind);
  if (!ids) {
    throw new Error(
      `Expected a Kavita ${kind} ID or URL on the configured server`,
    );
  }
  return ids;
}

function create(
  api: SourceExtensionApi,
  settings: OptionValues = {},
): ReturnType<SourceExtension["create"]> {
  const base = serverUrl(settings["server-url"]?.toString());
  const key = process.env.COMIC_DL_KAVITA_API_KEY?.trim();
  if (!base || !key) {
    throw new Error(
      "Set Kavita server-url (or COMIC_DL_KAVITA_URL) and COMIC_DL_KAVITA_API_KEY",
    );
  }
  const keyBase = serverUrl(process.env.COMIC_DL_KAVITA_API_KEY_URL);
  if (keyBase?.href !== base.href) {
    throw new Error(
      "Bind the Kavita API key to the configured server with COMIC_DL_KAVITA_API_KEY_URL (or COMIC_DL_KAVITA_URL)",
    );
  }
  const authHeaders = { "x-api-key": key };

  function url(path: string, params?: Record<string, string>) {
    const target = new URL(path, base);
    if (params) target.search = new URLSearchParams(params).toString();
    return target;
  }

  async function request(target: URL, signal: AbortSignal, body?: object) {
    const headers = new Headers(authHeaders);
    if (body) headers.set("Content-Type", "application/json");
    try {
      const response = await fetch(target, {
        method: body ? "POST" : "GET",
        body: body && JSON.stringify(body),
        headers,
        credentials: "omit",
        redirect: "manual",
        signal: AbortSignal.any([signal, AbortSignal.timeout(30_000)]),
      });
      if (response.ok) {
        return { bytes: await response.bytes(), headers: response.headers };
      }
      await response.body?.cancel();
      if ([408, 429, 500, 502, 503, 504].includes(response.status)) {
        throw new api.TransientSourceError(
          `Kavita returned HTTP ${response.status}`,
        );
      }
      throw new api.SourceHttpError(response.status);
    } catch (cause) {
      signal.throwIfAborted();
      if (
        cause instanceof api.SourceHttpError ||
        cause instanceof api.TransientSourceError
      ) {
        throw cause;
      }
      // Reader/image may include the auth key in the URL.
      throw new api.TransientSourceError("Kavita request failed");
    }
  }

  async function json<T>(target: URL, signal: AbortSignal, body?: object) {
    const { bytes, headers } = await request(target, signal, body);
    try {
      return {
        data: JSON.parse(new TextDecoder().decode(bytes)) as T,
        headers,
      };
    } catch {
      throw new Error("Kavita did not return JSON");
    }
  }

  function workId(id: number) {
    return url(`api/Series/${id}`).href;
  }

  async function readChapter(id: number, signal: AbortSignal) {
    const { data } = await json<ChapterInfo>(
      url("api/Reader/chapter-info", {
        chapterId: String(id),
        extractPdf: "true",
        includeDimensions: "true",
      }),
      signal,
    );
    if (!data || !isId(data.seriesId) || !isId(data.libraryId)) {
      throw new Error("Kavita chapter not found");
    }
    return data;
  }

  function chapter(
    seriesId: number,
    libraryId: number,
    id: number,
    title: string,
    firstInfo?: ChapterInfo,
  ): Chapter {
    if (!isId(id)) throw new Error("Invalid Kavita chapter ID");
    return {
      id: String(id),
      title,
      async getPages(signal): Promise<Page[]> {
        const info = firstInfo ?? (await readChapter(id, signal));
        firstInfo = undefined;
        if (info.seriesId !== seriesId || info.libraryId !== libraryId) {
          throw new Error(
            "Kavita chapter belongs to a different series or library",
          );
        }
        if (info.seriesFormat === 3) {
          throw new Error("Kavita EPUB books cannot be exported as CBZ");
        }
        if (
          !Array.isArray(info.pageDimensions) ||
          info.pageDimensions.length !== info.pages
        ) {
          throw new Error("Incomplete Kavita page metadata");
        }
        return info.pageDimensions
          .toSorted((a, b) => a.pageNumber - b.pageNumber)
          .map((page, index) => {
            if (page.pageNumber !== index || !page.fileName) {
              throw new Error("Invalid Kavita page sequence");
            }
            const suffix = extname(page.fileName).slice(1).toLowerCase();
            const extension = suffix === "jpeg" ? "jpg" : suffix;
            if (!api.imageExtensions.includes(extension as Page["extension"])) {
              throw new Error("Unsupported Kavita image extension");
            }
            return {
              id: `${index}:${page.fileName}`,
              extension: extension as Page["extension"],
              async read(signal) {
                // This endpoint also takes the key as a query parameter in Kavita's reader.
                const target = url("api/Reader/image", {
                  chapterId: String(id),
                  page: String(index),
                  extractPdf: "true",
                  apiKey: authHeaders["x-api-key"],
                });
                const { bytes, headers } = await request(target, signal);
                const type = headers
                  .get("content-type")
                  ?.split(";")[0]
                  .trim()
                  .toLowerCase();
                if (imageTypes.get(type ?? "") !== extension) {
                  throw new Error("Kavita returned an unexpected image type");
                }
                return bytes;
              },
            };
          });
      },
    };
  }

  return {
    id: "kavita",
    async search(query, page, signal) {
      const { data, headers } = await json<SeriesDto[]>(
        url("api/Series/v2", {
          PageNumber: String(page),
          PageSize: String(pageSize),
        }),
        signal,
        {
          // Kavita's series-name filter uses Matches (7) for substring search.
          statements: query ? [{ field: 1, comparison: 7, value: query }] : [],
          // SeriesSortField.SortName
          sortOptions: { sortField: 1, isAscending: true },
        },
      );
      if (!Array.isArray(data))
        throw new Error("Invalid Kavita series results");
      const pagination = headers.get("pagination");
      let hasNext = data.length === pageSize;
      if (pagination) {
        const { totalPages } = JSON.parse(pagination) as { totalPages: number };
        if (!Number.isInteger(totalPages))
          throw new Error("Invalid Kavita pagination");
        hasNext = page < totalPages;
      }
      return {
        hasNext,
        results: data.map((series) => {
          if (!isId(series.id) || !isId(series.libraryId)) {
            throw new Error("Invalid Kavita series or library ID");
          }
          return {
            title: series.localizedName || series.name || String(series.id),
            url: url(`library/${series.libraryId}/series/${series.id}`).href,
          };
        }),
      };
    },
    async getSeries(input, signal) {
      const { id: seriesId, libraryId } = inputIds(input, base, "series");
      const { data: series } = await json<SeriesDto>(
        url(`api/Series/${seriesId}`),
        signal,
      );
      if (
        !series ||
        series.id !== seriesId ||
        !isId(series.libraryId) ||
        (libraryId && libraryId !== series.libraryId)
      ) {
        throw new Error("Kavita series not found in the requested library");
      }
      const { data: volumes } = await json<VolumeDto[]>(
        url("api/Series/volumes", { seriesId: String(seriesId) }),
        signal,
      );
      if (
        !Array.isArray(volumes) ||
        volumes.some((volume) => volume.seriesId !== series.id)
      ) {
        throw new Error("Invalid Kavita volume list for this series");
      }
      return {
        id: workId(series.id),
        chapters: volumes.flatMap((volume) =>
          (volume.chapters ?? [])
            .toSorted((a, b) => a.sortOrder - b.sortOrder)
            .map((entry) =>
              chapter(
                series.id,
                series.libraryId,
                entry.id,
                entry.titleName ||
                  entry.title ||
                  entry.range ||
                  String(entry.id),
              ),
            ),
        ),
      };
    },
    async getChapter(input, signal) {
      const {
        id: chapterId,
        seriesId,
        libraryId,
      } = inputIds(input, base, "chapter");
      const info = await readChapter(chapterId, signal);
      if (
        (seriesId && seriesId !== info.seriesId) ||
        (libraryId && libraryId !== info.libraryId)
      ) {
        throw new Error(
          "Kavita chapter belongs to a different series or library",
        );
      }
      const title =
        info.chapterTitle ||
        info.title ||
        info.chapterNumber ||
        String(chapterId);
      return {
        workId: workId(info.seriesId),
        chapter: chapter(info.seriesId, info.libraryId, chapterId, title, info),
      };
    },
  };
}

const extension: ConfigurableSourceExtension = {
  apiVersion: 1,
  id: "kavita",
  settings: {
    "server-url": {
      type: "url",
      label: "Server URL",
      env: "COMIC_DL_KAVITA_URL",
    },
  },
  matchesUrl(input, kind, settings = {}) {
    const base = serverUrl(settings["server-url"]?.toString());
    return !!base && !!linkIds(input, base, kind);
  },
  create,
};

export default extension as SourceExtension;
