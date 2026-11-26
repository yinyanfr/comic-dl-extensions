# comic-dl-extensions

这里维护 [comic-dl](https://github.com/yinyanfr/comic-dl) 的两个漫画源。每个源独立发布到 npm，版本也独立维护。

| 扩展                               | npm 包                | 源 ID       |
| ---------------------------------- | --------------------- | ----------- |
| [CopyManga](extensions/copymanga/) | `@comic-dl/copymanga` | `copymanga` |
| [Zerobyw](extensions/zerobyw/)     | `@comic-dl/zerobyw`   | `zerobyw`   |

CLI 安装示例：`comic-dl add @comic-dl/zerobyw`。库用法与 Zerobyw 的 Cookie 配置见 [comic-dl 文档](https://yinyanfr.github.io/comic-dl/)。

## 开发

使用 Node.js 24。在仓库根目录运行 `npm ci`、`npm run typecheck` 和 `npm test`。两个源各自使用离线样本验证站点行为。如果要验证尚未发布的核心版本，可以在核心仓库运行 `npm pack`，再在此仓库执行 `npm install --no-save --package-lock=false /path/to/comic-dl-3.0.0-alpha.tgz`，用本地打包产物代替 npm 版本。

分别打包或发布：

```sh
npm pack --workspace @comic-dl/zerobyw
npm publish --workspace @comic-dl/zerobyw
npm pack --workspace @comic-dl/copymanga
npm publish --workspace @comic-dl/copymanga
```
