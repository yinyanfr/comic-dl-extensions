# 动漫屋 / 漫画人

[English](README.en.md)

`@comic-dl/dm5` 是 [comic-dl](https://github.com/yinyanfr/comic-dl) 的动漫屋与漫画人共用源。它通过动漫屋网页搜索、列章和下载公开章节，也接受漫画人的作品和章节链接。同一章用两个站点的链接下载到同一目录时共用一个 CBZ。需要登录或购买的章节不受支持。

## 使用

按 [comic-dl 快速入门](https://yinyanfr.github.io/comic-dl/guide/quickstart/) 安装 CLI，再运行：

```sh
comic-dl add @comic-dl/dm5
comic-dl search 妖神记 --source dm5
comic-dl list 'https://www.manhuaren.com/manhua-yaoshenji/'
comic-dl chapter 'https://www.dm5.com/m426475/' -o ./downloads
```
