import type {
  Chapter,
  ChapterSource,
  OptionValues,
  Page,
  SourceExtension,
  SourceExtensionApi,
} from "comic-dl/extension";

interface SeriesDto {
  id: string;
  name: string;
  deleted: boolean;
  metadata: { title: string };
}

interface BookDto {
  id: string;
  seriesId: string;
  name: string;
  deleted: boolean;
  media: { mediaType: string };
  metadata: { title: string };
}

interface PageDto {
  number: number;
  fileName: string;
  mediaType: string;
}

interface Paged<T> {
  content: T[];
  last: boolean;
}

const idPattern = /^[a-z0-9_-]+$/i;
const seriesPath = /^(?:series|oneshot)\/([a-z0-9_-]+)\/?$/i;
const chapterPath = /^book\/([a-z0-9_-]+)(?:\/read)?\/?$/i;
const imageTypes: ReadonlyMap<string, Page["extension"]> = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
]);

function serverUrl(input = process.env.COMIC_DL_KOMGA_URL ?? "") {
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

function linkId(url: URL, base: URL, kind: "series" | "chapter") {
  if (
    url.origin !== base.origin ||
    url.username ||
    url.password ||
    !url.pathname.startsWith(base.pathname)
  ) {
    return;
  }
  const path = url.pathname.slice(base.pathname.length);
  return (kind === "series" ? seriesPath : chapterPath).exec(path)?.[1];
}

function inputId(input: string, base: URL, kind: "series" | "chapter") {
  if (idPattern.test(input)) {
    return input;
  }
  const url = URL.parse(input);
  const id = url && linkId(url, base, kind);
  if (!id) {
    throw new Error(
      `Expected a Komga ${kind} ID or URL on the configured server`,
    );
  }
  return id;
}

function create(
  api: SourceExtensionApi,
  settings: OptionValues = {},
): ChapterSource {
  const base = serverUrl(settings["server-url"]?.toString());
  const key = process.env.COMIC_DL_KOMGA_API_KEY?.trim();
  if (!base || !key) {
    throw new Error(
      "Set Komga server-url (or COMIC_DL_KOMGA_URL) and COMIC_DL_KOMGA_API_KEY",
    );
  }
  const keyBase = serverUrl(process.env.COMIC_DL_KOMGA_API_KEY_URL);
  if (keyBase?.href !== base.href) {
    throw new Error(
      "Bind the Komga API key to the configured server with COMIC_DL_KOMGA_API_KEY_URL (or COMIC_DL_KOMGA_URL)",
    );
  }
  const authHeaders = { "X-API-Key": key, Accept: "application/json, image/*" };

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
          `Komga returned HTTP ${response.status}`,
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
      throw new api.TransientSourceError("Komga request failed");
    }
  }

  async function json<T>(
    target: URL,
    signal: AbortSignal,
    body?: object,
  ): Promise<T> {
    const { bytes } = await request(target, signal, body);
    try {
      return JSON.parse(new TextDecoder().decode(bytes)) as T;
    } catch {
      throw new Error("Komga did not return JSON");
    }
  }

  function workId(id: string) {
    return url(`series/${id}`).href;
  }

  function chapter(book: BookDto): Chapter {
    if (typeof book.id !== "string" || !idPattern.test(book.id)) {
      throw new Error("Invalid Komga book ID");
    }
    return {
      id: book.id,
      title: book.metadata?.title || book.name || book.id,
      async getPages(signal): Promise<Page[]> {
        if (book.media?.mediaType === "application/epub+zip") {
          throw new Error("Komga EPUB books cannot be exported as CBZ");
        }
        const path = `api/v1/books/${book.id}/pages`;
        const pages = await json<PageDto[]>(url(path), signal);
        if (!Array.isArray(pages)) throw new Error("Invalid Komga page list");
        return pages
          .toSorted((a, b) => a.number - b.number)
          .map((page, index) => {
            if (
              page.number !== index + 1 ||
              typeof page.fileName !== "string"
            ) {
              throw new Error("Invalid Komga page sequence");
            }
            const mediaType = page.mediaType?.toLowerCase();
            const original = imageTypes.get(mediaType ?? "");
            const extension = original ?? "png";
            const expected = original ? mediaType : "image/png";
            const target = url(
              `${path}/${page.number}`,
              original ? undefined : { convert: "png" },
            );
            return {
              id: `${page.number}:${page.fileName}`,
              extension,
              async read(signal) {
                const { bytes, headers } = await request(target, signal);
                if (
                  headers
                    .get("content-type")
                    ?.split(";")[0]
                    .trim()
                    .toLowerCase() !== expected
                ) {
                  throw new Error("Komga returned an unexpected image type");
                }
                return bytes;
              },
            };
          });
      },
    };
  }

  return {
    id: "komga",
    async search(query, page, signal) {
      const { content, last } = await json<Paged<SeriesDto>>(
        url("api/v1/series/list", { page: String(page - 1), size: "20" }),
        signal,
        query
          ? { fullTextSearch: query }
          : { condition: { deleted: { operator: "isFalse" } } },
      );
      if (!Array.isArray(content) || typeof last !== "boolean") {
        throw new Error("Invalid Komga series results");
      }
      return {
        hasNext: !last,
        results: content
          .filter((item) => !item.deleted)
          .map((item) => {
            if (typeof item.id !== "string" || !idPattern.test(item.id)) {
              throw new Error("Invalid Komga series ID");
            }
            return {
              title: item.metadata?.title || item.name || item.id,
              url: workId(item.id),
            };
          }),
      };
    },
    async getSeries(input, signal) {
      const id = inputId(input, base, "series");
      const series = await json<SeriesDto>(url(`api/v1/series/${id}`), signal);
      if (series.id !== id || series.deleted)
        throw new Error("Komga series not found");
      const { content } = await json<Paged<BookDto>>(
        url("api/v1/books/list", {
          unpaged: "true",
          sort: "metadata.numberSort,asc",
        }),
        signal,
        { condition: { seriesId: { operator: "is", value: id } } },
      );
      if (
        !Array.isArray(content) ||
        content.some((book) => book.seriesId !== id)
      ) {
        throw new Error("Invalid Komga book list for this series");
      }
      return {
        id: workId(id),
        chapters: content.filter((book) => !book.deleted).map(chapter),
      };
    },
    async getChapter(input, signal) {
      const id = inputId(input, base, "chapter");
      const book = await json<BookDto>(url(`api/v1/books/${id}`), signal);
      if (
        book.id !== id ||
        book.deleted ||
        typeof book.seriesId !== "string" ||
        !idPattern.test(book.seriesId)
      ) {
        throw new Error("Komga book not found");
      }
      return { workId: workId(book.seriesId), chapter: chapter(book) };
    },
  };
}

const extension: SourceExtension = {
  apiVersion: 1,
  id: "komga",
  settings: {
    "server-url": {
      type: "url",
      label: "Server URL",
      env: "COMIC_DL_KOMGA_URL",
    },
  },
  matchesUrl(input, kind, settings = {}) {
    const base = serverUrl(settings["server-url"]?.toString());
    return !!base && !!linkId(input, base, kind);
  },
  create,
};

export default extension;
