<p align="center">
  <img src="assets/readme-icon.svg" alt="comic-dl-extensions 图标：漫画与扩展拼图" width="144" height="144" />
</p>

<h1 align="center">comic-dl-extensions</h1>

<p align="center">
  <strong>更多来源，同一个书架。</strong><br />
  为 comic-dl CLI、库与 Web 界面提供漫画源<br />
  独立安装 · 独立版本 · 统一扩展 API
</p>

<p align="center">
  <a href="https://github.com/yinyanfr/comic-dl"><img src="https://img.shields.io/badge/comic--dl-4.x-0F766E?style=flat-square" alt="面向 comic-dl 4.x" /></a>
  <a href="https://yinyanfr.github.io/comic-dl/extensions/develop/"><img src="https://img.shields.io/badge/Extension_API-v1-5276A3?style=flat-square" alt="扩展 API v1" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-24-5FA04E?style=flat-square&amp;logo=nodedotjs&amp;logoColor=white" alt="Node.js 24" /></a>
  <a href="https://github.com/yinyanfr/comic-dl-extensions/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/yinyanfr/comic-dl-extensions/ci.yml?branch=main&amp;style=flat-square&amp;label=CI" alt="CI 状态" /></a>
  <a href="https://github.com/yinyanfr/comic-dl-extensions/actions/workflows/publish-npm.yml"><img src="https://img.shields.io/github/actions/workflow/status/yinyanfr/comic-dl-extensions/publish-npm.yml?branch=main&amp;style=flat-square&amp;label=Publish" alt="npm 发布状态" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-A96927?style=flat-square" alt="MIT 许可证" /></a>
</p>

<p align="center">
  <a href="#漫画源">漫画源</a> ·
  <a href="#安装">安装</a> ·
  <a href="https://github.com/yinyanfr/comic-dl">核心项目</a> ·
  <a href="https://github.com/yinyanfr/comic-dl-web">Web 界面</a> ·
  <a href="CHANGELOG.md">更新日志</a> ·
  <a href="README.en.md">English</a>
</p>

## 漫画源

这里维护 [comic-dl](https://github.com/yinyanfr/comic-dl) 的漫画源。每个源独立打包，版本也独立维护，可按需安装。

| 扩展                               | npm 包                | 源 ID       |
| ---------------------------------- | --------------------- | ----------- |
| [CopyManga](extensions/copymanga/) | `@comic-dl/copymanga` | `copymanga` |
| [Zerobyw](extensions/zerobyw/)     | `@comic-dl/zerobyw`   | `zerobyw`   |
| [动漫屋 / 漫画人](extensions/dm5/) | `@comic-dl/dm5`       | `dm5`       |
| [Komga](extensions/komga/)         | `@comic-dl/komga`     | `komga`     |
| [Kavita](extensions/kavita/)       | `@comic-dl/kavita`    | `kavita`    |

## 安装

使用 Node.js 24 安装 CLI 和所需扩展，例如：

```sh
npm install -g comic-dl@latest
comic-dl add @comic-dl/copymanga
```

当前版本为 CopyManga、Komga、Kavita `0.3.0`，Zerobyw `0.3.1`，DM5 `0.2.1`，完整的元数据、封面和章节上下文能力配合 `comic-dl` 4.x 使用。从旧次版本升级时，若原范围不包含新版本，请重新运行 `comic-dl add @comic-dl/copymanga@latest`（替换为对应包名）；`comic-dl update` 仍遵守原版本范围。

各扩展 README 说明对应的设置、认证和命令。用 Node.js 代码直接注册扩展，参见 [库使用指南](https://yinyanfr.github.io/comic-dl/guide/library/)。

各包版本和变更见 [Changelog（英文）](CHANGELOG.md)。

## 配合 Web 界面

想在浏览器中浏览来源、下载漫画、管理书架和自动追更？请查看 [comic-dl-web](https://github.com/yinyanfr/comic-dl-web)，一个基于 comic-dl 的独立自托管 Web 界面，适合 NAS 与本地收藏。这里的扩展负责来源解析与认证，Web 通过核心公开 API 使用它们；安装、配置与部署说明见 Web 仓库。

## 开发

元数据、鉴权封面和章节直链目录关联通过核心公开 API 接入，站点认证和解析仍由扩展负责；归档命名、格式、任务进度和迁移由核心处理。

使用 Node.js 24。在仓库根目录运行 `npm ci`、`npm run typecheck` 和 `npm test`。开发依赖固定为已发布的 `comic-dl@4.0.0`，扩展从 `comic-dl/extension` 导入 API v1 公开类型。测试未来未发布的核心改动时，可在核心仓库运行 `npm pack`，再用 `npm install --no-save --package-lock=false /path/to/comic-dl-VERSION.tgz` 本地联调，不提交本地路径；发布扩展前必须先发布其依赖的核心版本。

单独检查扩展的打包产物：

```sh
npm pack --workspace @comic-dl/zerobyw
```

维护者请参阅 [npm 发布指南](docs/releasing.md)。
