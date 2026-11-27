# comic-dl-extensions

[简体中文](README.md)

This repository maintains manga source extensions for [comic-dl](https://github.com/yinyanfr/comic-dl). Each extension is packaged and versioned independently.

| Extension                                      | npm package           | Source ID   |
| ---------------------------------------------- | --------------------- | ----------- |
| [CopyManga](extensions/copymanga/README.en.md) | `@comic-dl/copymanga` | `copymanga` |
| [Zerobyw](extensions/zerobyw/README.en.md)     | `@comic-dl/zerobyw`   | `zerobyw`   |
| [DM5 / Manhuaren](extensions/dm5/README.en.md) | `@comic-dl/dm5`       | `dm5`       |
| [Komga](extensions/komga/README.en.md)         | `@comic-dl/komga`     | `komga`     |
| [Kavita](extensions/kavita/README.en.md)       | `@comic-dl/kavita`    | `kavita`    |

Use Node.js 24 to install the CLI and add the extension you want. For example:

```sh
npm install -g comic-dl@latest
comic-dl add @comic-dl/copymanga
```

CopyManga, Zerobyw, Komga, and Kavita introduced runtime settings in extension version `0.2.0`. These settings require `comic-dl` 3.2.0 or later. If your saved version range excludes `0.2.0`, rerun `comic-dl add @comic-dl/copymanga@0.2.0` with the appropriate package name. `comic-dl update` respects the saved range.

Each extension's README covers its settings, authentication, and commands. To register extensions directly from Node.js, see the [library guide](https://yinyanfr.github.io/comic-dl/en/guide/library/).

## Development

Use Node.js 24. From the repository root, run:

```sh
npm ci
npm run typecheck
npm test
```

Each extension uses offline fixtures to test source behavior. To test with an unpublished core build, run `npm pack` in the core repository, then run `npm install --no-save --package-lock=false /path/to/comic-dl-VERSION.tgz` in this repository, substituting the generated filename.

Inspect an extension's package independently:

```sh
npm pack --workspace @comic-dl/zerobyw
```

Maintainers can find release instructions in the [npm release guide](docs/releasing.en.md).
