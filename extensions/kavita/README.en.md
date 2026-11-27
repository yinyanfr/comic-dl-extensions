# Kavita

> Version `0.3.0` targets core 4.x with optional metadata and opaque `coverId`. Read protected images on the server with `app.readCover(coverId, { source: 'kavita' })`. Only the bound server's constrained image endpoint is used, never arbitrary URLs or public Auth Key URLs. Direct links resolve canonical catalogs; missing metadata is nonfatal. See the [core API](https://yinyanfr.github.io/comic-dl/en/guide/service-api/).

[简体中文](README.md)

`@comic-dl/kavita` connects [comic-dl](https://github.com/yinyanfr/comic-dl) to a self-hosted Kavita library. It uses the [Kavita REST API](https://www.kavitareader.com/docs/api) to search by series title, list chapters and specials across volumes, and download CBZ archives. It supports comics the server can serve page by page and requests image extraction for PDFs. EPUB is unsupported.

## Usage

Install the CLI with Node.js 24 and generate a Kavita Auth Key under **User Settings → Manage Auth Keys**:

```sh
npm install -g comic-dl@latest
comic-dl add @comic-dl/kavita
export COMIC_DL_KAVITA_URL='https://nas.example/kavita'
export COMIC_DL_KAVITA_API_KEY='<Kavita Auth Key>'

comic-dl search 'Series title' --source kavita
comic-dl list "$COMIC_DL_KAVITA_URL/library/LIBRARY_ID/series/SERIES_ID"
comic-dl chapter "$COMIC_DL_KAVITA_URL/library/LIBRARY_ID/series/SERIES_ID/manga/CHAPTER_ID" -o ~/manga
```

Replace the example URL, key, and IDs with your own. The base URL includes any reverse-proxy subpath, but no `/api`, query string, or credentials. Full URLs matching the configured server select the source automatically. For a numeric series or chapter ID, specify `--source kavita`. Kavita's image endpoint uses the `apiKey` query parameter, so server or reverse-proxy logs that include query strings may record the key.

## Runtime settings

With `@comic-dl/kavita` 0.2.0 and `comic-dl` 3.2.0 or later, use `--set` for a one-command server override, or save `server-url` under `sourceSettings.kavita` in the [CLI config](https://yinyanfr.github.io/comic-dl/en/reference/config/). Keep supplying the key through `COMIC_DL_KAVITA_API_KEY`:

```sh
export COMIC_DL_KAVITA_API_KEY_URL='https://nas.example/kavita'
comic-dl search 'Series title' --source kavita --set "kavita.server-url=$COMIC_DL_KAVITA_API_KEY_URL"
```

The key binding must match the full server URL, including any reverse-proxy subpath. If `COMIC_DL_KAVITA_API_KEY_URL` is unset, the binding falls back to `COMIC_DL_KAVITA_URL`. If you set the server only in the CLI config, supply the binding explicitly.
