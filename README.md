# comic-dl-extensions

[English](README.en.md)

这里维护 [comic-dl](https://github.com/yinyanfr/comic-dl) 的漫画源。每个源独立打包，版本也独立维护。

| 扩展                               | npm 包                | 源 ID       |
| ---------------------------------- | --------------------- | ----------- |
| [CopyManga](extensions/copymanga/) | `@comic-dl/copymanga` | `copymanga` |
| [Zerobyw](extensions/zerobyw/)     | `@comic-dl/zerobyw`   | `zerobyw`   |
| [动漫屋 / 漫画人](extensions/dm5/) | `@comic-dl/dm5`       | `dm5`       |
| [Komga](extensions/komga/)         | `@comic-dl/komga`     | `komga`     |
| [Kavita](extensions/kavita/)       | `@comic-dl/kavita`    | `kavita`    |

CLI 安装示例：`comic-dl add @comic-dl/zerobyw`。库用法与 Zerobyw 的 Cookie 配置见 [comic-dl 文档](https://yinyanfr.github.io/comic-dl/)。

## 开发

使用 Node.js 24。在仓库根目录运行 `npm ci`、`npm run typecheck` 和 `npm test`。各源使用离线样本验证站点行为。如果要验证尚未发布的核心版本，可以在核心仓库运行 `npm pack`，再在此仓库执行 `npm install --no-save --package-lock=false /path/to/comic-dl-3.0.0-alpha.tgz`，用本地打包产物代替 npm 版本。

单独检查扩展的打包产物：

```sh
npm pack --workspace @comic-dl/zerobyw
```

## 发布到 npm

用 `npm version <版本> --workspace @comic-dl/zerobyw --no-git-tag-version` 更新扩展版本，并提交扩展的 `package.json` 和根目录的 `package-lock.json`。推送到 `main` 后，工作流会检查整个仓库，但只打包并发布版本发生变化的扩展。预发布使用 `next`，正式版使用 `latest`，已有版本跳过。

工作流合入后，为每个 npm 包分别添加 [GitHub Actions Trusted Publisher](https://docs.npmjs.com/trusted-publishers/)：所有者 `yinyanfr`、仓库 `comic-dl-extensions`、工作流文件 `publish-npm.yml`，环境留空，并启用直接发布（`npm publish`）。无需 npm Token。新的信任绑定必须在两天内完成首次发布；全新包须先手动发布首版，才能配置自动发布。
