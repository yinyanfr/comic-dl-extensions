import { Uint8ArrayReader, Uint8ArrayWriter, ZipReader } from "@zip.js/zip.js";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { env, execPath } from "node:process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const require = createRequire(import.meta.url);
const metadata = require.resolve("comic-dl/package.json");
const cli = join(dirname(metadata), require(metadata).bin["comic-dl"]);
const extension = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const dm5 = "https://www.dm5.com";
const manhuaren = "https://www.manhuaren.com";

function mockFetch() {
  const dm5 = "https://www.dm5.com";
  const manhuaren = "https://www.manhuaren.com";
  const cdn = "https://example.cdndm5.com";
  const catalog = `<ul class="mh-list"><li><h2 class="title">
    <a href="/manhua-example/">示例漫画</a></h2></li></ul>`;
  const series = `<script>var DM5_COMIC_MID=81;</script>
    <div id="chapterlistload"><ul>
      <li><a href="/m101/"><p class="title">First</p></a></li>
      <li><a href="/m102/"><p class="title">Locked</p><span class="detail-lock"></span></a></li>
      <li><a href="/m103/"><p class="title">Direct images</p></a></li>
    </ul></div>`;
  const chapter = (id) =>
    `<title>Chapter ${id}</title><script>var DM5_MID=81; var DM5_CID=${id};
      var DM5_IMAGE_COUNT=2; var DM5_VIEWSIGN_DT="2026-01-01 00:00:00";
      var DM5_VIEWSIGN="test-sign";</script>`;
  globalThis.fetch = async (input, init) => {
    const url = new URL(input);
    const headers = new Headers(init.headers);
    if (headers.has("cookie") || headers.has("authorization")) {
      throw new Error("Unexpected credentials");
    }
    if (url.origin === manhuaren) {
      if (url.pathname === "/manhua-example/") {
        return new Response("<script>var DM5_MID=81;</script>");
      }
      if (url.pathname === "/showcomic/") {
        return Response.redirect("https://en.dm5.com/manhua-example/");
      }
      if (url.pathname === "/m101/") {
        return new Response(chapter(101));
      }
      if (url.pathname === "/m103/") {
        return new Response(
          "<script>var DM5_MID=91; var DM5_CID=103;</script>",
        );
      }
    }
    if (
      url.origin === "https://en.dm5.com" &&
      url.pathname === "/manhua-example/"
    ) {
      return new Response(series);
    }
    if (url.origin === dm5) {
      if (url.pathname === "/search") {
        if (url.searchParams.get("title") !== "漫画 & 测试") {
          throw new Error("Search query was not preserved");
        }
        return new Response(
          `${catalog}<div class="page-pagination"><a>&gt;</a></div>`,
        );
      }
      if (url.pathname === "/manhua-list-p1/") {
        return new Response(catalog);
      }
      if (url.pathname === "/manhua-example/") {
        return new Response(series);
      }
      if (url.pathname === "/m101/") {
        return new Response(chapter(101));
      }
      if (url.pathname === "/m102/") {
        return new Response(
          '<div class="view-pay-form">Requires purchase</div>',
        );
      }
      if (url.pathname === "/m103/") {
        return new Response(`${chapter(103)}<div id="barChapter">
          <img class="load-src" data-src="${cdn}/a.jpg?token=test">
          <img class="load-src" data-src="${cdn}/b.png?token=test">
          </div>`);
      }
      if (url.pathname === "/m101/chapterfun.ashx") {
        if (
          headers.get("referer") !== `${dm5}/m101/` ||
          headers.get("x-requested-with") !== "XMLHttpRequest" ||
          url.searchParams.get("_mid") !== "81" ||
          url.searchParams.get("_cid") !== "101" ||
          url.searchParams.get("_sign") !== "test-sign" ||
          url.searchParams.get("_dt") !== "2026-01-01 00:00:00"
        ) {
          throw new Error("Unexpected reader request");
        }
        const path = url.searchParams.get("page") === "1" ? "a.jpg" : "b.png";
        return new Response(
          `eval(function(){throw Error("do not run site code")}('0 1="${cdn}";0 2=["/${path}","/prefetched.jpg"]; 2[i]=1+2[i]+\\'?token=test\\';',3,3,'var|pix|pvalue'.split('|'),0,{}))`,
        );
      }
    }
    if (url.origin === cdn) {
      if (
        ![`${dm5}/m101/`, `${dm5}/m103/`].includes(headers.get("referer")) ||
        url.searchParams.get("token") !== "test"
      ) {
        throw new Error("Missing CDN Referer or signing query");
      }
      return new Response(url.pathname, {
        headers: {
          "Content-Type": url.pathname.endsWith(".png")
            ? "image/png"
            : "image/jpeg",
        },
      });
    }
    throw new Error(`Unexpected test request: ${url.origin}${url.pathname}`);
  };
}

function run(args, directory) {
  const preload = Buffer.from(`(${mockFetch.toString()})();`).toString(
    "base64",
  );
  return exec(
    execPath,
    [
      "--import",
      `data:text/javascript;base64,${preload}`,
      cli,
      ...args,
      "--extension",
      extension,
    ],
    { env: { ...env, COMIC_DL_EXTENSION_DIR: join(directory, "extensions") } },
  );
}

async function scratch(t) {
  const directory = await mkdtemp(join(tmpdir(), "comic-dl-dm5-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("Dm5 searches the catalog and auto-selects the same source for both sites", async (t) => {
  const directory = await scratch(t);
  const catalog = await run(["search", "--source", "dm5"], directory);
  const search = await run(
    ["search", "漫画 & 测试", "--source", "dm5"],
    directory,
  );
  assert.equal(catalog.stdout, `${dm5}/manhua-example/\t示例漫画\n`);
  assert.equal(search.stdout, catalog.stdout);
  assert.match(search.stderr, /Next page: 2/);

  const lists = await Promise.all(
    [
      `${dm5}/manhua-example/`,
      "https://m.dm5.com/manhua-example/",
      "https://www.dm5.cn/manhua-example/",
      `${manhuaren}/manhua-example/`,
      `${manhuaren}/showcomic/?id=81`,
    ].map((url) => run(["list", url], directory)),
  );
  for (const result of lists) {
    assert.equal(
      result.stdout,
      "101\tFirst\n102\tLocked\n103\tDirect images\n",
    );
  }
  await assert.rejects(
    run(["list", `${manhuaren}/showcomic/?id=91`], directory),
    { stderr: /Could not verify the mapped Dm5 series ID/ },
  );
});

test("Series and chapter links share one CBZ with correctly ordered pages", async (t) => {
  const directory = await scratch(t);
  const downloaded = await run(
    ["download", `${manhuaren}/manhua-example/`, "-c", "101", "-o", directory],
    directory,
  );
  assert.match(downloaded.stdout, /Downloaded:/);
  for (const origin of [dm5, manhuaren]) {
    const duplicate = await run(
      ["chapter", `${origin}/m101/`, "-o", directory],
      directory,
    );
    assert.match(duplicate.stdout, /Skipped:/);
  }
  const archives = (await readdir(directory)).filter((name) =>
    name.endsWith(".cbz"),
  );
  assert.equal(archives.length, 1);
  const archive = new ZipReader(
    new Uint8ArrayReader(await readFile(join(directory, archives[0]))),
  );
  try {
    const entries = await archive.getEntries();
    assert.deepEqual(
      entries.map((entry) => entry.filename),
      ["1.jpg", "2.png"],
    );
    const payloads = await Promise.all(
      entries.map((entry) => entry.getData(new Uint8ArrayWriter())),
    );
    assert.deepEqual(
      payloads.map((bytes) => new TextDecoder().decode(bytes)),
      ["/a.jpg", "/b.png"],
    );
  } finally {
    await archive.close();
  }
});

test("Dm5 handles inline images, restricted chapters and mismatched links", async (t) => {
  const directory = await scratch(t);
  const direct = await run(
    ["chapter", `${dm5}/m103/`, "-o", directory],
    directory,
  );
  assert.match(direct.stdout, /Downloaded:/);
  await assert.rejects(
    run(
      ["download", `${dm5}/manhua-example/`, "-c", "102", "-o", directory],
      directory,
    ),
    { code: 1, stderr: /Restricted: chapter 102 .*chapter as restricted/ },
  );
  await assert.rejects(
    run(["chapter", `${dm5}/m102/`, "-o", directory], directory),
    { code: 1, stderr: /chapter as restricted/ },
  );
  await assert.rejects(
    run(["chapter", `${manhuaren}/m103/`, "-o", directory], directory),
    { code: 1, stderr: /chapter work IDs do not match/ },
  );
});
