# CopyManga（拷贝漫画）

> 版本 `0.3.0` 面向核心 4.x：返回可选标题、作者、简介、题材和公共封面；章节直链保留系列与 `group`，由核心确定完整目录序号。缺失元数据不阻止下载。命名模板、CBZ/ZIP、任务与迁移见[核心 API](https://yinyanfr.github.io/comic-dl/guide/service-api/)。

[English](README.en.md)

`@comic-dl/copymanga` 是 [comic-dl](https://github.com/yinyanfr/comic-dl) 的拷贝漫画源。支持匿名搜索、列出章节和下载 CBZ。搜索使用 `www.copy20.com`，下载使用「熱辣漫畫 線路 2」，无需登录。

## 使用

### 搜索和下载

按 [comic-dl 快速入门](https://yinyanfr.github.io/comic-dl/guide/quickstart/) 安装 CLI，再运行：

```sh
comic-dl add @comic-dl/copymanga
comic-dl search 'Do It Yourself' --source copymanga

series_url='https://www.copy20.com/comic/doityourself'
comic-dl list "$series_url"
comic-dl download "$series_url" -c 1-2 -o ./downloads
```

示例下载当前分组的前两章。默认使用 `default` 分组；如果作品有单行本分组，可在作品链接末尾加 `?group=tankobon`。

### 运行时设置和目录筛选

以下功能需要 `@comic-dl/copymanga` 0.2.0 和 `comic-dl` 3.2.0 或更新版本：

```sh
comic-dl sources --source copymanga --options
comic-dl list doityourself --source copymanga --set copymanga.api-url=https://api.manga2025.com
```

- `site-url`（默认 `https://www.copy20.com`）：关键词搜索、目录浏览和生成作品链接。
- `api-url`（默认 `https://api.manga2025.com`）：列章和读取章节的 API。
- `api-user-agent`：章节 API 请求的 User-Agent，只接受可打印的 ASCII 字符。

两个地址都必须是 HTTPS 源地址，不含路径、查询、片段或凭据。要保存设置，把它们写入 [CLI 配置](https://yinyanfr.github.io/comic-dl/reference/config/)的 `sourceSettings.copymanga`。

省略搜索关键词即可浏览目录。`--options` 会显示排序和筛选的 ID，包括从站点读取的题材 ID：

```sh
comic-dl search --source copymanga --options
comic-dl search --source copymanga --sort popular --filter status=completed --filter region=japan
comic-dl search --source copymanga --sort popular --filter status=completed --filter region=japan --page 2
```

目录默认按最近更新排序（`updated`），也可选 `oldest-updated` 或 `popular`。筛选键为 `theme`（题材）、`region`（地区）和 `status`（状态）。关键词搜索沿用站点的搜索顺序，不支持目录筛选。
