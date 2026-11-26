# DM5 / Manhuaren

[简体中文](README.md)

`@comic-dl/dm5` adds DM5 and Manhuaren to [comic-dl](https://github.com/yinyanfr/comic-dl) as one source. It searches, lists, and downloads public chapters through the DM5 website and accepts series and chapter links from Manhuaren. The same chapter from either site uses the same CBZ in a given output directory. Chapters that require login or purchase are unsupported.

## Usage

Install the CLI with Node.js 24:

```sh
npm install -g comic-dl@3.0.0-alpha
comic-dl add @comic-dl/dm5

comic-dl search 妖神记 --source dm5
comic-dl list 'https://www.manhuaren.com/manhua-yaoshenji/'
comic-dl chapter 'https://www.dm5.com/m426475/' -o ./downloads
```
