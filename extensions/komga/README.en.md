# Komga

> Version `0.3.0` targets core 4.x with optional metadata and opaque `coverId`. Use `app.readCover(coverId, { source: 'komga' })` on the server for protected covers. IDs constrain the endpoint, keys remain bound to the full server URL, and redirects are refused without exposing keys. Direct links resolve their series catalog. See the [core API](https://yinyanfr.github.io/comic-dl/en/guide/service-api/).

[简体中文](README.md)

`@comic-dl/komga` connects [comic-dl](https://github.com/yinyanfr/comic-dl) to a self-hosted Komga library. It uses the [Komga REST API](https://komga.org/docs/openapi/komga-api/) to search series, list books, and download each book as a CBZ. Your account needs access to the library and the `PAGE_STREAMING` permission. Comics and PDFs the server can render page by page are supported; EPUB is unsupported.

## Usage

Install the CLI with Node.js 24:

```sh
npm install -g comic-dl@latest
comic-dl add @comic-dl/komga
export COMIC_DL_KOMGA_URL='https://nas.example/komga'
export COMIC_DL_KOMGA_API_KEY='<Komga API Key>'

comic-dl search 'Series title' --source komga
comic-dl list "$COMIC_DL_KOMGA_URL/series/SERIES_ID"
comic-dl chapter "$COMIC_DL_KOMGA_URL/book/BOOK_ID/read" -o ~/manga
```

Replace the example URL, key, and IDs with your own. The base URL includes any reverse-proxy subpath, but no `/api`, query string, or credentials. Full URLs matching the configured server select the source automatically. For a bare series or book ID, specify `--source komga`.

## Runtime settings

With `@comic-dl/komga` 0.2.0 and `comic-dl` 3.2.0 or later, use `--set` for a one-command server override, or save `server-url` under `sourceSettings.komga` in the [CLI config](https://yinyanfr.github.io/comic-dl/en/reference/config/). Keep supplying the key through `COMIC_DL_KOMGA_API_KEY`:

```sh
export COMIC_DL_KOMGA_API_KEY_URL='https://nas.example/komga'
comic-dl search 'Series title' --source komga --set "komga.server-url=$COMIC_DL_KOMGA_API_KEY_URL"
```

The key binding must match the full server URL, including any reverse-proxy subpath. If `COMIC_DL_KOMGA_API_KEY_URL` is unset, the binding falls back to `COMIC_DL_KOMGA_URL`. If you set the server only in the CLI config, supply the binding explicitly.
