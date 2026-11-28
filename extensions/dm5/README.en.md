# DM5 / Manhuaren

> Version `0.2.0` targets core 4.x with optional titles, authors, summaries, tags, and public covers. Reader-provided series links resolve canonical catalog positions. Missing metadata is nonfatal, and image signing data never enters public metadata. See the [core API](https://yinyanfr.github.io/comic-dl/en/guide/service-api/) for archives and progress.

[简体中文](README.md)

`0.2.1` fixes missing catalog covers by reading the current `.mh-cover` CSS background images while retaining keyword-search images and lazy-loading support, without per-series detail requests.

`@comic-dl/dm5` adds DM5 and Manhuaren to [comic-dl](https://github.com/yinyanfr/comic-dl) as one source. It searches, lists, and downloads public chapters through the DM5 website and accepts series and chapter links from Manhuaren. The same chapter from either site uses the same CBZ in a given output directory. Chapters that require login or purchase are unsupported.

## Usage

Install the CLI with Node.js 24:

```sh
npm install -g comic-dl@latest
comic-dl add @comic-dl/dm5

comic-dl search 妖神记 --source dm5
comic-dl list 'https://www.manhuaren.com/manhua-yaoshenji/'
comic-dl chapter 'https://www.dm5.com/m426475/' -o ./downloads
```
