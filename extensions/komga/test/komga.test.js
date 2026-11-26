import { Uint8ArrayReader, Uint8ArrayWriter, ZipReader } from "@zip.js/zip.js";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
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

test("Komga uses its documented search, book and one-based page endpoints", async (t) => {
  const series = {
    id: "s1",
    name: "Series",
    metadata: { title: "示例" },
    deleted: false,
  };
  const book = {
    id: "b1",
    seriesId: "s1",
    name: "Book",
    metadata: { title: "Volume 1" },
    media: { mediaType: "application/pdf" },
    deleted: false,
  };
  const requests = [];
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
      case "/komga/api/v1/series/list":
        return json({ content: [series], last: false });
      case "/komga/api/v1/series/s1":
        return json(series);
      case "/komga/api/v1/books/list":
        return json({ content: [book] });
      case "/komga/api/v1/books/b1":
        return json(book);
      case "/komga/api/v1/books/b1/pages":
        return json([
          { number: 2, fileName: "page.pdf", mediaType: "application/pdf" },
          { number: 1, fileName: "cover.jpg", mediaType: "image/jpeg" },
        ]);
      case "/komga/api/v1/books/b1/pages/1":
        return res.setHeader("Content-Type", "image/jpeg").end("first");
      case "/komga/api/v1/books/b1/pages/2":
        return res.setHeader("Content-Type", "image/png").end("second");
      case "/komga/api/v1/series/redirect":
        return res.writeHead(302, { Location: "/outside" }).end();
      default:
        return res.writeHead(404).end();
    }
  }).listen(0, "127.0.0.1");
  t.after(() => server.close());
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}/komga`;
  const directory = await mkdtemp(join(tmpdir(), "comic-dl-komga-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const run = (...args) =>
    exec(execPath, [cli, ...args, "--extension", extension], {
      env: {
        ...env,
        COMIC_DL_EXTENSION_DIR: join(directory, "extensions"),
        COMIC_DL_KOMGA_URL: base,
        COMIC_DL_KOMGA_API_KEY: "komga-test-key",
      },
    });

  const search = await run(
    "search",
    "示例 & comic",
    "--source",
    "komga",
    "--page",
    "2",
  );
  assert.equal(search.stdout, `${base}/series/s1\t示例\n`);
  assert.match(search.stderr, /Next page: 3/);
  const catalog = await run("search", "--source", "komga");
  assert.equal(catalog.stdout, search.stdout);
  const list = await run("list", `${base}/series/s1`);
  assert.equal(list.stdout, "b1\tVolume 1\n");
  const download = await run(
    "download",
    "s1",
    "--source",
    "komga",
    "-o",
    directory,
  );
  assert.match(download.stdout, /Downloaded:/);
  const again = await run("chapter", `${base}/book/b1/read`, "-o", directory);
  assert.match(again.stdout, /Skipped:/);
  await assert.rejects(run("list", `${base}/series/redirect`), {
    stderr: /HTTP 302/,
  });
  await assert.rejects(
    run(
      "list",
      "https://elsewhere.example/komga/series/s1",
      "--source",
      "komga",
    ),
    { stderr: /configured server/ },
  );

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
      ["1.jpg", "2.png"],
    );
    const images = await Promise.all(
      entries.map((entry) => entry.getData(new Uint8ArrayWriter())),
    );
    assert.deepEqual(
      images.map((data) => Buffer.from(data).toString()),
      ["first", "second"],
    );
  } finally {
    await archive.close();
  }

  const searchRequest = requests[0];
  assert.equal(searchRequest.method, "POST");
  assert.equal(searchRequest.url.searchParams.get("page"), "1");
  assert.deepEqual(JSON.parse(searchRequest.body), {
    fullTextSearch: "示例 & comic",
  });
  assert.deepEqual(JSON.parse(requests[1].body), {
    condition: { deleted: { operator: "isFalse" } },
  });
  const booksRequest = requests.find(({ url }) =>
    url.pathname.endsWith("/books/list"),
  );
  assert.equal(booksRequest.method, "POST");
  assert.equal(booksRequest.url.searchParams.get("unpaged"), "true");
  assert.equal(
    booksRequest.url.searchParams.get("sort"),
    "metadata.numberSort,asc",
  );
  assert.deepEqual(JSON.parse(booksRequest.body), {
    condition: { seriesId: { operator: "is", value: "s1" } },
  });
  const rendered = requests.find(({ url }) =>
    url.pathname.endsWith("/pages/2"),
  );
  assert.equal(rendered.url.searchParams.get("convert"), "png");
  assert.match(rendered.headers.accept, /image\/\*/);
  assert.ok(
    requests.every(
      ({ url, headers }) =>
        url.pathname.startsWith("/komga/api/") &&
        headers["x-api-key"] === "komga-test-key",
    ),
  );
});
