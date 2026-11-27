# Kavita

> 版本 `0.3.0` 面向核心 4.x，返回可选作品元数据和 `coverId`；用 `app.readCover(coverId, { source: 'kavita' })` 在服务端读取封面。只读取绑定服务的限定图片接口，不接受任意 URL，不返回带 Auth Key 的地址。章节直链关联原作品目录，缺失元数据不阻止下载。详见[核心 API](https://yinyanfr.github.io/comic-dl/guide/service-api/)。

[English](README.en.md)

`@comic-dl/kavita` 是 [comic-dl](https://github.com/yinyanfr/comic-dl) 的自托管 Kavita 书库源。它通过 [Kavita REST API](https://www.kavitareader.com/docs/api) 按作品名搜索、列出各卷的章节和番外，并下载为 CBZ。支持服务端能逐页提供图片的漫画，也会请求服务端将 PDF 提取为图片；EPUB 不受支持。

## 使用

按 [comic-dl 快速入门](https://yinyanfr.github.io/comic-dl/guide/quickstart/) 安装 CLI，并在 Kavita 的「用户设置 → Manage Auth Keys」生成 Auth Key：

```sh
comic-dl add @comic-dl/kavita
export COMIC_DL_KAVITA_URL='https://nas.example/kavita'
export COMIC_DL_KAVITA_API_KEY='<Kavita Auth Key>'

comic-dl search '作品名' --source kavita
comic-dl list "$COMIC_DL_KAVITA_URL/library/LIBRARY_ID/series/SERIES_ID"
comic-dl chapter "$COMIC_DL_KAVITA_URL/library/LIBRARY_ID/series/SERIES_ID/manga/CHAPTER_ID" -o ~/manga
```

将示例地址、密钥和 ID 换成自己服务器上的值。`COMIC_DL_KAVITA_URL` 包含反向代理子路径，但不能带 `/api`、查询或凭据。也可用 `--source kavita` 加数字作品或章节 ID；完整链接在匹配该地址时会自动选源。Kavita 的图片接口使用 `apiKey` 查询参数；服务端或反向代理记录查询参数时也可能记录这个密钥。

## 运行时设置

`@comic-dl/kavita` 0.2.0 搭配 `comic-dl` 3.2.0 或更新版本时，可以用 `--set` 临时设置服务器地址，或把 `server-url` 保存到 [CLI 配置](https://yinyanfr.github.io/comic-dl/reference/config/)的 `sourceSettings.kavita`。密钥仍由 `COMIC_DL_KAVITA_API_KEY` 提供：

```sh
export COMIC_DL_KAVITA_API_KEY_URL='https://nas.example/kavita'
comic-dl search '作品名' --source kavita --set "kavita.server-url=$COMIC_DL_KAVITA_API_KEY_URL"
```

密钥绑定地址必须匹配完整服务器地址，包括反向代理子路径。未设置 `COMIC_DL_KAVITA_API_KEY_URL` 时，绑定沿用 `COMIC_DL_KAVITA_URL`；如果只在 CLI 配置中设置了服务器地址，仍需明确提供绑定地址。
