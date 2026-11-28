# Zerobyw

> 版本 `0.3.0` 面向核心 4.x：返回页面提供的可选标题、作者、简介、标签和公共封面；章节直链关联作品目录，缺失元数据不影响下载。图片继续匿名读取，Cookie Origin 绑定不变；任务、命名与迁移见[核心 API](https://yinyanfr.github.io/comic-dl/guide/service-api/)。

[English](README.en.md)

`0.3.1` 修复目录与详情的 HTTP 封面：仅对已配置的受信任图片/站点 origin 安全升级为 HTTPS，不接受任意 HTTP 主机，不发送 Cookie，也不增加逐作品详情请求。

`@comic-dl/zerobyw` 是 [comic-dl](https://github.com/yinyanfr/comic-dl) 的 Zerobyw 漫画源。公开搜索无需登录，列章和下载需要有效的 Zerobyw 登录会话。

## 使用

按 [comic-dl 快速入门](https://yinyanfr.github.io/comic-dl/guide/quickstart/) 安装 CLI。在浏览器登录 Zerobyw 并打开作品页，在开发者工具的「网络」面板中刷新页面，从发往 `www.zerobyw33.com` 的请求复制 `Cookie` 请求头的值，保存在 `~/zerobyw-cookie.txt`。

```sh
comic-dl add @comic-dl/zerobyw
comic-dl search '漫画标题' --source zerobyw

export COMIC_DL_ZEROBYW_COOKIE="$(cat "$HOME/zerobyw-cookie.txt")"
series_url='https://www.zerobyw33.com/pc/details/?kuid=作品ID'
comic-dl list "$series_url"
comic-dl download "$series_url" -c 1-1 -o ./downloads
```

把 `series_url` 换成搜索结果第一列的链接。`-c 1-1` 只选列表中的第一章；也可以用 `-c` 指定 `list` 输出的章节 ID。若账号无权访问某一章，CLI 会将该章标为 `restricted`。

## 更换站点

以下设置需要 `@comic-dl/zerobyw` 0.2.0 和 `comic-dl` 3.2.0 或更新版本。地址均为不含路径、查询、片段或凭据的 HTTPS 源地址。可通过 `comic-dl sources --source zerobyw --options` 查看设置，或将设置保存到 [CLI 配置](https://yinyanfr.github.io/comic-dl/reference/config/)的 `sourceSettings.zerobyw`：

- `site-url`：网页地址，默认 `https://www.zerobyw33.com`。
- `image-url`：独立的图片地址，默认 `https://tupa.zerobyw33.com`。
- `previous-site-url`：曾经使用过的站点，仅用于识别输入的旧链接。内置默认站点的链接始终可识别；旧链接会保留原 ID 并在当前站点读取。

从自定义站点重新获取 Cookie，替换本地保存的值，然后把认证绑定到当前 `site-url`：

```sh
export COMIC_DL_ZEROBYW_COOKIE="$(cat "$HOME/zerobyw-cookie.txt")"
export COMIC_DL_ZEROBYW_COOKIE_ORIGIN='https://zerobyw.example'
comic-dl list "$series_url" --set "zerobyw.site-url=$COMIC_DL_ZEROBYW_COOKIE_ORIGIN"
```

未设置 `COMIC_DL_ZEROBYW_COOKIE_ORIGIN` 时，Cookie 仅用于默认站点。搜索和图片请求不发送 Cookie。
