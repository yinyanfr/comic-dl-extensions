# Komga

> 版本 `0.3.0` 面向核心 4.x，返回作品元数据和 `coverId`；用 `app.readCover(coverId, { source: 'komga' })` 在服务端读取鉴权封面。只接受来源内 ID，密钥仍绑定完整服务地址，拒绝外部重定向，不在公开结果返回密钥。章节直链关联原作品目录；任务、命名与迁移见[核心 API](https://yinyanfr.github.io/comic-dl/guide/service-api/)。

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

## 运行时设置

`@comic-dl/komga` 0.2.0 搭配 `comic-dl` 3.2.0 或更新版本时，可以用 `--set` 临时设置服务器地址，或把 `server-url` 保存到 [CLI 配置](https://yinyanfr.github.io/comic-dl/reference/config/)的 `sourceSettings.komga`。密钥仍由 `COMIC_DL_KOMGA_API_KEY` 提供：

```sh
export COMIC_DL_KOMGA_API_KEY_URL='https://nas.example/komga'
comic-dl search '作品名' --source komga --set "komga.server-url=$COMIC_DL_KOMGA_API_KEY_URL"
```

密钥绑定地址必须匹配完整服务器地址，包括反向代理子路径。未设置 `COMIC_DL_KOMGA_API_KEY_URL` 时，绑定沿用 `COMIC_DL_KOMGA_URL`；如果只在 CLI 配置中设置了服务器地址，仍需明确提供绑定地址。
