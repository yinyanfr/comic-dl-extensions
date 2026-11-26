# Komga

[English](README.en.md)

`@comic-dl/komga` 是 [comic-dl](https://github.com/yinyanfr/comic-dl) 的自托管 Komga 书库源。它通过 [Komga REST API](https://komga.org/docs/openapi/komga-api/) 搜索作品、列出书籍，并逐页下载为 CBZ。每本书对应一个章节；账号需要能访问目标书库，并具有 `PAGE_STREAMING` 权限。支持可逐页读取的漫画和服务器可渲染的 PDF；EPUB 不受支持。

## 使用

按 [comic-dl 快速入门](https://yinyanfr.github.io/comic-dl/guide/quickstart/) 安装 CLI，再运行：

```sh
comic-dl add @comic-dl/komga
export COMIC_DL_KOMGA_URL='https://nas.example/komga'
export COMIC_DL_KOMGA_API_KEY='<Komga API Key>'

comic-dl search '作品名' --source komga
comic-dl list "$COMIC_DL_KOMGA_URL/series/SERIES_ID"
comic-dl chapter "$COMIC_DL_KOMGA_URL/book/BOOK_ID/read" -o ~/manga
```

将示例地址、密钥和 ID 换成自己服务器上的值。`COMIC_DL_KOMGA_URL` 包含反向代理子路径，但不能带 `/api`、查询或凭据。也可用 `--source komga` 加作品或书籍的短 ID；完整链接在匹配该地址时会自动选源。
