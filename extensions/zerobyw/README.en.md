# Zerobyw

> Version `0.3.0` targets core 4.x: optional page-provided titles, authors, summaries, tags, and public covers, with direct chapters linked to canonical catalogs. Missing metadata is nonfatal. Images remain anonymous and Cookie origin binding is unchanged. See the [core API](https://yinyanfr.github.io/comic-dl/en/guide/service-api/) for tasks, naming, and migrations.

[简体中文](README.md)

`@comic-dl/zerobyw` adds Zerobyw to [comic-dl](https://github.com/yinyanfr/comic-dl). Public search works without signing in. Listing or downloading chapters requires an active Zerobyw session.

## Usage

Install the CLI with Node.js 24:

```sh
npm install -g comic-dl@latest
comic-dl add @comic-dl/zerobyw
comic-dl search 'Manga title' --source zerobyw
```

Sign in to Zerobyw in your browser and open a series page. In the browser's Network panel, reload the page and copy the `Cookie` request header from the request to `www.zerobyw33.com`. Save it to `~/zerobyw-cookie.txt` outside the repository, then run:

```sh
export COMIC_DL_ZEROBYW_COOKIE="$(cat "$HOME/zerobyw-cookie.txt")"
series_url='https://www.zerobyw33.com/pc/details/?kuid=SERIES_ID'
comic-dl list "$series_url"
comic-dl download "$series_url" -c 1-1 -o ./downloads
```

Replace `series_url` with the URL from the first column of the search results. `-c 1-1` selects the first chapter; you can also pass a chapter ID from `list` to `-c`. Chapters your account cannot access are reported as `restricted`.

## Changing the site

These settings require `@comic-dl/zerobyw` 0.2.0 and `comic-dl` 3.2.0 or later. All addresses must be HTTPS origins with no path, query, fragment, or credentials. Run `comic-dl sources --source zerobyw --options` to inspect the settings, or save them under `sourceSettings.zerobyw` in the [CLI config](https://yinyanfr.github.io/comic-dl/en/reference/config/):

- `site-url`: website origin, defaulting to `https://www.zerobyw33.com`.
- `image-url`: separate image origin, defaulting to `https://tupa.zerobyw33.com`.
- `previous-site-url`: a previously used site, accepted only in input links. Links on the default site are always recognized. Old links keep their original IDs and are resolved on the current site.

Get a fresh Cookie from the custom site, replace the saved value, and bind it to the active `site-url`:

```sh
export COMIC_DL_ZEROBYW_COOKIE="$(cat "$HOME/zerobyw-cookie.txt")"
export COMIC_DL_ZEROBYW_COOKIE_ORIGIN='https://zerobyw.example'
comic-dl list "$series_url" --set "zerobyw.site-url=$COMIC_DL_ZEROBYW_COOKIE_ORIGIN"
```

If `COMIC_DL_ZEROBYW_COOKIE_ORIGIN` is unset, the Cookie is scoped to the default site. Search and image requests do not send the Cookie.
