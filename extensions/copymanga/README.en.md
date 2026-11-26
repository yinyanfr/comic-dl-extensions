# CopyManga

[简体中文](README.md)

`@comic-dl/copymanga` adds CopyManga to [comic-dl](https://github.com/yinyanfr/comic-dl). Search, list chapters, and download CBZ archives without signing in. Searches use `www.copy20.com`, and downloads use the “熱辣漫畫” Line 2 endpoint.

## Usage

Install the CLI with Node.js 24:

```sh
npm install -g comic-dl@3.0.0-alpha
comic-dl add @comic-dl/copymanga
comic-dl search 'Do It Yourself' --source copymanga

series_url='https://www.copy20.com/comic/doityourself'
comic-dl list "$series_url"
comic-dl download "$series_url" -c 1-2 -o ./downloads
```

This downloads the first two chapters in the selected group. The default group is `default`. If the series offers a collected-volume group, append `?group=tankobon` to its URL.

See the [CopyManga guide](https://yinyanfr.github.io/comic-dl/guide/copymanga/) (Simplified Chinese) for more options.
