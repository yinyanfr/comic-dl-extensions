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

使用 Node.js 24 安装 CLI 和所需扩展，例如：

```sh
npm install -g comic-dl@latest
comic-dl add @comic-dl/copymanga
```

CopyManga、Zerobyw、Komga 和 Kavita 从扩展 `0.2.0` 起提供运行时设置，需要 `comic-dl` 3.2.0 或更新版本。若已安装 `0.1.x` 且原版本范围不包含 `0.2.0`，请重新运行 `comic-dl add @comic-dl/copymanga@0.2.0`（替换为对应包名）；`comic-dl update` 遵守原版本范围。

各扩展 README 说明对应的设置、认证和命令。用 Node.js 代码直接注册扩展，参见 [库使用指南](https://yinyanfr.github.io/comic-dl/guide/library/)。

各包版本和变更见 [Changelog（英文）](CHANGELOG.md)。

## 开发

使用 Node.js 24。在仓库根目录运行 `npm ci`、`npm run typecheck` 和 `npm test`。开发和离线测试使用 `comic-dl@3.2.0`，扩展从 `comic-dl/extension` 导入 API v1 的公开类型，包括来源设置和目录选项。如果要验证尚未发布的核心版本，可以在核心仓库运行 `npm pack`，再在此仓库执行 `npm install --no-save --package-lock=false /path/to/comic-dl-VERSION.tgz`（替换为实际生成的文件），用本地打包产物代替 npm 版本。

单独检查扩展的打包产物：

```sh
npm pack --workspace @comic-dl/zerobyw
```

维护者请参阅 [npm 发布指南](docs/releasing.md)。
