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

Current versions are CopyManga, Zerobyw, Komga, and Kavita `0.3.0`, and DM5 `0.2.0`. Their complete metadata, cover, and chapter-context features use `comic-dl` 4.x. If an older saved range excludes the new minor version, rerun `comic-dl add @comic-dl/copymanga@latest` with the appropriate package name. `comic-dl update` still respects saved ranges.

Each extension's README covers its settings, authentication, and commands. To register extensions directly from Node.js, see the [library guide](https://yinyanfr.github.io/comic-dl/en/guide/library/).

See the [changelog](CHANGELOG.md) for release history by package version.

## Development

Metadata, protected covers, and canonical direct-link context use public core APIs. Authentication and site parsing stay in the extensions; naming, formats, task progress, and archive migration belong to the core.

Use Node.js 24. From the repository root, run:

```sh
npm ci
npm run typecheck
npm test
```

Development pins the published `comic-dl@4.0.0` and imports public API v1 types from `comic-dl/extension`. To test future unpublished core changes, use `npm pack` in the core repository and `npm install --no-save --package-lock=false /path/to/comic-dl-VERSION.tgz` here, without committing local paths. Publish the required core before releasing extensions.

Inspect an extension's package independently:

```sh
npm pack --workspace @comic-dl/zerobyw
```

Maintainers can find release instructions in the [npm release guide](docs/releasing.en.md).
