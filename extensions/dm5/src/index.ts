import { load } from "cheerio/slim";
import type {
  Chapter,
  ImageExtension,
  Page,
  SourceExtension,
  SourceExtensionApi,
} from "comic-dl/extension";
import { extname } from "node:path/posix";
import { parseReaderImage } from "./reader-script.js";

const site = "https://www.dm5.com";
const manhuaren = "https://www.manhuaren.com";
const desktopOrigins = [site, "https://www.dm5.cn", "https://en.dm5.com"];
const dm5Origins = [...desktopOrigins, "https://m.dm5.com"];
const siteHeaders = {
  "Accept-Language": "zh-TW",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0",
};
const anonymous = { credentialHeaders: {}, credentialOrigins: [] };
const numericId = /^[1-9]\d*$/;
const seriesPath = /^\/manhua-([a-z0-9][a-z0-9-]*)\/?$/i;
const chapterPath = /^\/m([1-9]\d*)\/?$/;
const decoder = new TextDecoder();

function identify(url: URL) {
  if (url.username || url.password) {
    return;
  }
  const fromManhuaren = url.origin === manhuaren;
  if (!fromManhuaren && !dm5Origins.includes(url.origin)) {
    return;
  }
  const chapter = chapterPath.exec(url.pathname)?.[1];
  if (chapter) {
    return { kind: "chapter", chapter, fromManhuaren } as const;
  }
  const slug = seriesPath.exec(url.pathname)?.[1];
  if (slug) {
    return { kind: "series", slug, fromManhuaren } as const;
  }
  const id = url.searchParams.get("id");
  if (
    fromManhuaren &&
    /^\/showcomic\/?$/i.test(url.pathname) &&
    url.searchParams.getAll("id").length === 1 &&
    id &&
    numericId.test(id)
  ) {
    return { kind: "work-id", id } as const;
  }
}

function seriesUrl(slug: string) {
  return new URL(`/manhua-${slug}/`, site);
}

function chapterUrl(id: string) {
  return new URL(`/m${id}/`, site);
}

function scriptId($: ReturnType<typeof load>, name: string) {
  // These names are fixed reader/series variables, never URL input.
  const assignment = new RegExp(`\\b${name}\\s*=\\s*([1-9]\\d*)\\s*;`);
  return assignment.exec($("script:not([src])").text())?.[1];
}

function imageUrl(input: string, base: URL) {
  const url = URL.parse(input, base.href);
  if (
    !url ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !url.hostname.endsWith(".cdndm5.com")
  ) {
    throw new Error("Unrecognized Dm5 image origin");
  }
  return url;
}

function coverUrl(value: string | undefined, base: URL): string | undefined {
  const url = value && URL.parse(value, base.href);
  return url &&
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash
    ? url.href
    : undefined;
}

function create(
  api: SourceExtensionApi,
): ReturnType<SourceExtension["create"]> {
  const readDm5 = api.createSourceHttp({
    ...anonymous,
    requestHeaders: siteHeaders,
    allowedOrigins: desktopOrigins,
  });
  const readManhuaren = api.createSourceHttp({
    ...anonymous,
    requestHeaders: siteHeaders,
    allowedOrigins: [manhuaren, ...desktopOrigins],
  });

  async function document(read: typeof readDm5, url: URL, signal: AbortSignal) {
    const response = await read(url, signal);
    return { $: load(decoder.decode(response.bytes)), url: response.url };
  }

  async function readSeries(input: string, signal: AbortSignal) {
    const url = URL.parse(input);
    const link = url && identify(url);
    if (!url || !link || link.kind === "chapter") {
      throw new Error("Expected a Dm5 or Manhuaren series URL");
    }
    let slug: string;
    let expectedId: string | undefined;
    if (link.kind === "work-id") {
      const { url: destination } = await document(readManhuaren, url, signal);
      const mapped = identify(destination);
      if (mapped?.kind !== "series" || mapped.fromManhuaren) {
        throw new Error("Could not map Manhuaren work ID to a Dm5 series");
      }
      slug = mapped.slug;
      expectedId = link.id;
    } else {
      slug = link.slug;
      if (link.fromManhuaren) {
        const { $ } = await document(readManhuaren, url, signal);
        expectedId = scriptId($, "DM5_MID");
        if (!expectedId) {
          throw new Error("Could not verify Manhuaren work ID");
        }
      }
    }
    const result = await document(readDm5, seriesUrl(slug), signal);
    const id = scriptId(result.$, "DM5_COMIC_MID");
    if (!id || (expectedId && id !== expectedId)) {
      throw new Error("Could not verify the mapped Dm5 series ID");
    }
    return { ...result, id };
  }

  async function readReader(id: string, signal: AbortSignal) {
    const result = await document(readDm5, chapterUrl(id), signal);
    if (result.$(".view-pay-form").length) {
      throw new api.RestrictedChapterError(
        "Dm5 marked this chapter as restricted",
      );
    }
    const workId = scriptId(result.$, "DM5_MID");
    if (!workId || scriptId(result.$, "DM5_CID") !== id) {
      throw new Error("Could not verify the Dm5 chapter and work IDs");
    }
    return { ...result, workId };
  }

  async function getImages(
    reader: Awaited<ReturnType<typeof readReader>>,
    id: string,
    signal: AbortSignal,
  ) {
    const { $, url, workId } = reader;
    const script = $("script:not([src])").text();
    const count = Number(scriptId($, "DM5_IMAGE_COUNT"));
    if (!Number.isSafeInteger(count) || count < 1 || count > 2000) {
      throw new Error("Invalid Dm5 reader page count");
    }
    const direct = $("#barChapter > img.load-src").toArray();
    if (direct.length) {
      if (direct.length !== count) {
        throw new Error("Incomplete Dm5 reader image list");
      }
      return direct.map((img) => imageUrl($(img).attr("data-src") ?? "", url));
    }

    const date = /\bDM5_VIEWSIGN_DT\s*=\s*(['"])([^'"]+)\1/.exec(script)?.[2];
    const sign = /\bDM5_VIEWSIGN\s*=\s*(['"])([^'"]+)\1/.exec(script)?.[2];
    if (!date || !sign) {
      throw new Error("Dm5 reader did not provide page request data");
    }
    const readScript = api.createSourceHttp({
      ...anonymous,
      requestHeaders: {
        ...siteHeaders,
        Referer: url.href,
        "X-Requested-With": "XMLHttpRequest",
      },
      allowedOrigins: [url.origin],
    });
    const endpoint = new URL(`/m${id}/chapterfun.ashx`, url.origin);
    const images: URL[] = [];
    for (let page = 1; page <= count; page++) {
      endpoint.search = new URLSearchParams({
        cid: id,
        page: String(page),
        key: "",
        language: "1",
        gtk: "6",
        _cid: id,
        _mid: workId,
        _dt: date,
        _sign: sign,
      }).toString();
      const { bytes } = await readScript(endpoint, signal);
      images.push(imageUrl(parseReaderImage(decoder.decode(bytes)), url));
    }
    return images;
  }

  function chapter(
    workId: string,
    id: string,
    title: string,
    locked = false,
    firstReader?: Awaited<ReturnType<typeof readReader>>,
  ): Chapter {
    return {
      id,
      title,
      async getPages(signal): Promise<Page[]> {
        if (locked) {
          throw new api.RestrictedChapterError(
            "Dm5 marked this chapter as restricted",
          );
        }
        const reader = firstReader ?? (await readReader(id, signal));
        firstReader = undefined;
        if (reader.workId !== workId) {
          throw new Error("Dm5 chapter belongs to a different series");
        }
        const images = await getImages(reader, id, signal);
        return images.map((image, index) => {
          const extension = extname(image.pathname)
            .slice(1)
            .toLowerCase() as ImageExtension;
          if (!api.imageExtensions.includes(extension)) {
            throw new Error("Unsupported Dm5 image extension");
          }
          const readImage = api.createSourceHttp({
            ...anonymous,
            requestHeaders: { Referer: reader.url.href },
            allowedOrigins: [image.origin],
          });
          return {
            id: `${index + 1}:${image.pathname}`,
            extension,
            async read(signal) {
              const { bytes, contentType } = await readImage(image, signal);
              if (!contentType?.toLowerCase().startsWith("image/")) {
                throw new Error("Dm5 did not return an image");
              }
              return bytes;
            },
          };
        });
      },
    };
  }

  return {
    id: "dm5",
    async search(query, page, signal) {
      const target = new URL(`/manhua-list-p${page}/`, site);
      if (query) {
        target.pathname = "/search";
        target.search = new URLSearchParams({
          title: query,
          language: "1",
          page: String(page),
        }).toString();
      }
      const { $, url } = await document(readDm5, target, signal);
      if (!$("ul.mh-list, .banner_detail_form").length) {
        throw new Error("Dm5 did not return a search or catalog page");
      }
      const results = new Map<
        string,
        { title: string; url: string; coverUrl?: string }
      >();
      for (const element of $("ul.mh-list > li, .banner_detail_form")) {
        const anchor = $(element).find(".title > a[href]").first();
        const title = anchor.text().trim();
        const href = URL.parse(anchor.attr("href") ?? "", url.href);
        const link = href && identify(href);
        if (title && link?.kind === "series") {
          const canonical = seriesUrl(link.slug).href;
          // Current catalog cards use a CSS background; search highlights use img.
          // Read only the cover node's URL, never evaluate inline styles.
          const style =
            $(element).find(".mh-cover").first().attr("style") ?? "";
          const background =
            /(?:^|;)\s*background-image\s*:\s*url\(\s*(?:"([^"]*)"|'([^']*)'|([^'"\s()]+))\s*\)\s*(?:;|$)/i.exec(
              style,
            );
          results.set(canonical, {
            title,
            url: canonical,
            coverUrl: coverUrl(
              $(element).find("img").first().attr("data-src") ??
                $(element).find("img").first().attr("src") ??
                background?.[1] ??
                background?.[2] ??
                background?.[3],
              url,
            ),
          });
        }
      }
      const hasNext = $(".page-pagination a")
        .toArray()
        .some((element) => [">", "下一页"].includes($(element).text().trim()));
      return { results: [...results.values()], hasNext };
    },
    async getSeries(input, signal) {
      const { $, url, id } = await readSeries(input, signal);
      const list = $("#chapterlistload");
      if (!list.length || $(".warning-bar").length) {
        throw new Error("Dm5 did not make the chapter list available");
      }
      const chapters = new Map<string, Chapter>();
      for (const element of list.find("ul > li > a[href]")) {
        const anchor = $(element);
        const href = URL.parse(anchor.attr("href") ?? "", url.href);
        const link = href && identify(href);
        if (link?.kind !== "chapter" || chapters.has(link.chapter)) {
          continue;
        }
        const title =
          anchor.find(".title").first().text().trim() || anchor.text().trim();
        const locked = anchor.find(".detail-lock, .view-lock").length > 0;
        chapters.set(
          link.chapter,
          chapter(id, link.chapter, title || link.chapter, locked),
        );
      }
      return {
        id,
        chapters: [...chapters.values()],
        metadata: {
          title:
            $(".banner_detail_form .title").first().text().trim() ||
            $("h1").first().text().trim() ||
            undefined,
          summary:
            $(".detail-list-form-intro, .content").first().text().trim() ||
            undefined,
          authors: $(".banner_detail_form a[href*='author']")
            .map((_, node) => $(node).text().trim())
            .get(),
          tags: $(".banner_detail_form a[href*='tag']")
            .map((_, node) => $(node).text().trim())
            .get(),
          coverUrl: coverUrl(
            $(".banner_detail_form img, .banner_detail_cover img")
              .first()
              .attr("src"),
            url,
          ),
        },
      };
    },
    async getChapter(input, signal) {
      const url = URL.parse(input);
      const link = url && identify(url);
      if (!url || link?.kind !== "chapter") {
        throw new Error("Expected a Dm5 or Manhuaren chapter URL");
      }
      let expectedWork: string | undefined;
      if (link.fromManhuaren) {
        const { $ } = await document(readManhuaren, url, signal);
        expectedWork = scriptId($, "DM5_MID");
        if (!expectedWork || scriptId($, "DM5_CID") !== link.chapter) {
          throw new Error("Could not verify Manhuaren chapter and work IDs");
        }
      }
      const reader = await readReader(link.chapter, signal);
      if (expectedWork && reader.workId !== expectedWork) {
        throw new Error("Manhuaren and Dm5 chapter work IDs do not match");
      }
      const title = reader.$("title").text().split("_在线漫画阅读")[0].trim();
      const seriesInput = reader
        .$("a[href]")
        .toArray()
        .map((node) => {
          const url = URL.parse(
            reader.$(node).attr("href") ?? "",
            reader.url.href,
          );
          return url && identify(url)?.kind === "series" ? url.href : undefined;
        })
        .find((url) => url !== undefined);
      return {
        workId: reader.workId,
        seriesInput,
        chapter: chapter(
          reader.workId,
          link.chapter,
          title || link.chapter,
          false,
          reader,
        ),
      };
    },
  };
}

const extension: SourceExtension = {
  apiVersion: 1,
  id: "dm5",
  matchesUrl(url, kind) {
    const link = identify(url);
    return (
      link !== undefined &&
      (link.kind === "chapter" ? "chapter" : "series") === kind
    );
  },
  create,
};

export default extension;
