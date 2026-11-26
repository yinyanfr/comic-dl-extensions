# CopyManga（拷贝漫画）

[English](README.en.md)

`@comic-dl/copymanga` 是 [comic-dl](https://github.com/yinyanfr/comic-dl) 的拷贝漫画源。支持匿名搜索、列出章节和下载 CBZ。搜索使用 `www.copy20.com`，下载使用「熱辣漫畫 線路 2」，无需登录。

## 使用

按 [comic-dl 快速入门](https://yinyanfr.github.io/comic-dl/guide/quickstart/) 安装 CLI，再运行：

```sh
comic-dl add @comic-dl/copymanga
comic-dl search 'Do It Yourself' --source copymanga

series_url='https://www.copy20.com/comic/doityourself'
comic-dl list "$series_url"
comic-dl download "$series_url" -c 1-2 -o ./downloads
```

示例下载当前分组的前两章。默认使用 `default` 分组；如果作品有单行本分组，可在作品链接末尾加 `?group=tankobon`。

更多选项见主项目的 [CopyManga 指南](https://yinyanfr.github.io/comic-dl/guide/copymanga/)。
