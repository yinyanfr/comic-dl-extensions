# Komga

[简体中文](README.md)

`@comic-dl/komga` connects [comic-dl](https://github.com/yinyanfr/comic-dl) to a self-hosted Komga library. It uses the [Komga REST API](https://komga.org/docs/openapi/komga-api/) to search series, list books, and download each book as a CBZ. Your account needs access to the library and the `PAGE_STREAMING` permission. Comics and PDFs the server can render page by page are supported; EPUB is unsupported.

## Usage

Install the CLI with Node.js 24:

```sh
npm install -g comic-dl@3.0.0-alpha
comic-dl add @comic-dl/komga
export COMIC_DL_KOMGA_URL='https://nas.example/komga'
export COMIC_DL_KOMGA_API_KEY='<Komga API Key>'

comic-dl search 'Series title' --source komga
comic-dl list "$COMIC_DL_KOMGA_URL/series/SERIES_ID"
comic-dl chapter "$COMIC_DL_KOMGA_URL/book/BOOK_ID/read" -o ~/manga
```

Replace the example URL, key, and IDs with your own. The base URL includes any reverse-proxy subpath, but no `/api`, query string, or credentials. Full URLs matching the configured server select the source automatically. For a bare series or book ID, specify `--source komga`.
