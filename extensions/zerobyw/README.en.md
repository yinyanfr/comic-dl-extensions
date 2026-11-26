# Zerobyw

[简体中文](README.md)

`@comic-dl/zerobyw` adds Zerobyw to [comic-dl](https://github.com/yinyanfr/comic-dl). Public search works without signing in. Listing or downloading chapters requires an active Zerobyw session.

## Usage

Install the CLI with Node.js 24:

```sh
npm install -g comic-dl@3.0.0-alpha
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

See the [Zerobyw guide](https://yinyanfr.github.io/comic-dl/guide/quickstart/#使用-zerobyw) (Simplified Chinese) for more details.
