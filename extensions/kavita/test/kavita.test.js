import { Uint8ArrayReader, Uint8ArrayWriter, ZipReader } from "@zip.js/zip.js";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { outputFiles as readdir } from "../../../test/output.js";
import { createServer } from "node:http";
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

test("Kavita settings require an API key binding to the same server URL", async () => {
  await exec(
    execPath,
    [
      "--input-type=module",
      "-e",
      `
    import assert from "node:assert/strict";
    import adapter from ${JSON.stringify(new URL("../dist/index.js", import.meta.url).href)};
    const settings = { "server-url": "https://kavita.example/kavita/" };
    assert.throws(() => adapter.create({}, settings), /COMIC_DL_KAVITA_API_KEY_URL/);
    process.env.COMIC_DL_KAVITA_API_KEY_URL = "https://kavita.example/kavita";
    assert.equal(adapter.create({}, settings).id, "kavita");
    assert.throws(() => adapter.create({}, { "server-url": "https://example.invalid/kavita" }), /COMIC_DL_KAVITA_API_KEY_URL/);
  `,
    ],
    {
      env: {
        ...env,
        COMIC_DL_KAVITA_URL: undefined,
        COMIC_DL_KAVITA_API_KEY_URL: undefined,
        COMIC_DL_KAVITA_API_KEY: "test-key",
      },
    },
  );
});

test("Kavita uses the auth key, catalog pagination, volumes and zero-based reader pages", async (t) => {
  const series = {
    id: 11,
    libraryId: 7,
    name: "Original",
    localizedName: "本地化标题",
    summary: "Summary",
    writers: [{ name: "Author" }],
    genres: [{ title: "Genre" }],
  };
  const chapter = {
    id: 21,
    range: "1",
    titleName: "Chapter One",
    sortOrder: 1,
  };
  const requests = [];
  let includeRedirect = false;
  const key = "kavita-test+key";
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString();
    requests.push({ url, method: req.method, headers: req.headers, body });
    const json = (value) =>
      res
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify(value));
    switch (url.pathname) {
      case "/kavita/api/Series/v2":
        res.setHeader(
          "Pagination",
          JSON.stringify({ currentPage: 2, totalPages: 3 }),
        );
        return json([series]);
      case "/kavita/api/Series/11":
        return json(series);
      case "/kavita/api/image/series-cover":
        return res.setHeader("Content-Type", "image/png").end("cover");
      case "/kavita/api/Series/volumes":
        return json([
          {
            seriesId: 11,
            chapters: includeRedirect
              ? [chapter, { ...chapter, id: 22 }]
              : [chapter],
          },
          { seriesId: 11, chapters: [] },
        ]);
      case "/kavita/api/Reader/chapter-info":
        return json({
          seriesId: 11,
          libraryId: 7,
          seriesFormat: 1,
          chapterTitle: "Chapter One",
          pages: 2,
          pageDimensions: [
            { pageNumber: 1, fileName: "/two.webp" },
            { pageNumber: 0, fileName: "/one.jpeg" },
          ],
        });
      case "/kavita/api/Reader/image": {
        if (url.searchParams.get("chapterId") === "22") {
          return res.writeHead(302, { Location: "/outside" }).end();
        }
        const first = url.searchParams.get("page") === "0";
        return res
          .setHeader("Content-Type", first ? "image/jpeg" : "image/webp")
          .end(first ? "one" : "two");
      }
      default:
        return res.writeHead(404).end();
    }
  }).listen(0, "127.0.0.1");
  t.after(() => server.close());
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}/kavita`;
  const directory = await mkdtemp(join(tmpdir(), "comic-dl-kavita-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const run = (...args) =>
    exec(execPath, [cli, ...args, "--extension", extension], {
      env: {
        ...env,
        COMIC_DL_EXTENSION_DIR: join(directory, "extensions"),
        COMIC_DL_KAVITA_URL: `${base}/`,
        COMIC_DL_KAVITA_API_KEY_URL: undefined,
        COMIC_DL_KAVITA_API_KEY: key,
      },
    });

  const url = `${base}/library/7/series/11`;
  const search = await run(
    "search",
    "测试",
    "--source",
    "kavita",
    "--page",
    "2",
  );
  assert.equal(search.stdout, `${url}\t本地化标题\n`);
  assert.match(search.stderr, /Next page: 3/);
  const catalog = await run("search", "--source", "kavita");
  assert.equal(catalog.stdout, search.stdout);
  const list = await run("list", url);
  assert.equal(list.stdout, "21\tChapter One\n");
  const download = await run("download", url, "-o", directory);
  assert.match(download.stdout, /Downloaded:/);
  const again = await run("chapter", `${url}/manga/21?page=4`, "-o", directory);
  assert.match(again.stdout, /Skipped:/);
  await assert.rejects(
    run("chapter", `${base}/library/7/series/19/manga/21`, "-o", directory),
    { stderr: /different series or library/ },
  );
  includeRedirect = true;
  const redirect = await run(
    "chapter",
    "22",
    "--source",
    "kavita",
    "-o",
    directory,
  ).catch((error) => error);
  assert.equal(redirect.code, 1);
  assert.match(redirect.stderr, /HTTP 302/);
  assert.ok(!redirect.stderr.includes(key));

  const [archiveName, ...extra] = (await readdir(directory)).filter((name) =>
    name.endsWith(".cbz"),
  );
  assert.deepEqual(extra, []);
  const archive = new ZipReader(
    new Uint8ArrayReader(await readFile(join(directory, archiveName))),
  );
  try {
    const entries = await archive.getEntries();
    assert.deepEqual(
      entries.map((entry) => entry.filename),
      ["1.jpg", "2.webp"],
    );
    const images = await Promise.all(
      entries.map((entry) => entry.getData(new Uint8ArrayWriter())),
    );
    assert.deepEqual(
      images.map((data) => Buffer.from(data).toString()),
      ["one", "two"],
    );
  } finally {
    await archive.close();
  }

  const searchRequest = requests[0];
  assert.equal(searchRequest.method, "POST");
  assert.equal(searchRequest.url.searchParams.get("PageNumber"), "2");
  assert.deepEqual(JSON.parse(searchRequest.body).statements, [
    { field: 1, comparison: 7, value: "测试" },
  ]);
  assert.deepEqual(JSON.parse(requests[1].body).statements, []);
  const volumes = requests.find(({ url }) => url.pathname.endsWith("/volumes"));
  assert.equal(volumes.url.searchParams.get("seriesId"), "11");
  const info = requests.find(({ url }) =>
    url.pathname.endsWith("/chapter-info"),
  );
  assert.equal(info.url.searchParams.get("includeDimensions"), "true");
  const images = requests.filter(({ url }) => url.pathname.endsWith("/image"));
  assert.deepEqual(
    images.map(({ url }) => url.searchParams.get("page")),
    ["0", "1", "0"],
  );
  assert.ok(images.every(({ url }) => url.searchParams.get("apiKey") === key));
  assert.ok(
    requests.every(
      ({ url, headers }) =>
        url.pathname.startsWith("/kavita/api/") && headers["x-api-key"] === key,
    ),
  );
  await exec(
    execPath,
    [
      "--input-type=module",
      "-e",
      `
    import assert from "node:assert/strict";
    import { createDownloader } from "comic-dl";
    import adapter from ${JSON.stringify(new URL("../dist/index.js", import.meta.url).href)};
    const app = createDownloader({source:"kavita"}).use(adapter);
    const series = await app.list("11");
    assert.equal(series.metadata.title, "本地化标题");
    assert.deepEqual(series.metadata.authors, ["Author"]);
    assert.equal(series.metadata.summary, "Summary");
    assert.equal((await app.search("")).results[0].coverId, "11");
    assert.equal((await app.readCover(series.metadata.coverId)).contentType, "image/png");
    await assert.rejects(app.readCover("../outside"));
    assert.ok(!JSON.stringify(series.metadata).includes("kavita-test"));
  `,
    ],
    {
      env: {
        ...env,
        COMIC_DL_KAVITA_URL: base,
        COMIC_DL_KAVITA_API_KEY_URL: base,
        COMIC_DL_KAVITA_API_KEY: key,
      },
    },
  );
});
