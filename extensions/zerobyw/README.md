# Zerobyw

[English](README.en.md)

`@comic-dl/zerobyw` 是 [comic-dl](https://github.com/yinyanfr/comic-dl) 的 Zerobyw 漫画源。公开搜索无需登录，列章和下载需要有效的 Zerobyw 登录会话。

## 使用

按 [comic-dl 快速入门](https://yinyanfr.github.io/comic-dl/guide/quickstart/#使用-zerobyw) 安装 CLI 并获取登录 Cookie：

```sh
comic-dl add @comic-dl/zerobyw
comic-dl search '漫画标题' --source zerobyw

export COMIC_DL_ZEROBYW_COOKIE="$(cat "$HOME/zerobyw-cookie.txt")"
series_url='https://www.zerobyw33.com/pc/details/?kuid=作品ID'
comic-dl list "$series_url"
comic-dl download "$series_url" -c 1-1 -o ./downloads
```

把 `series_url` 换成搜索结果第一列的链接。`-c 1-1` 只选列表中的第一章；也可以用 `-c` 指定 `list` 输出的章节 ID。若账号无权访问某一章，CLI 会将该章标为 `restricted`。
