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

Install a published extension with `comic-dl add @comic-dl/zerobyw`. Each extension's README covers setup and usage. See the [comic-dl documentation](https://yinyanfr.github.io/comic-dl/) (Simplified Chinese) for CLI and library usage.

## Development

Use Node.js 24. From the repository root, run:

```sh
npm ci
npm run typecheck
npm test
```

Each extension uses offline fixtures to test source behavior. To test with an unpublished core build, run `npm pack` in the core repository, then run `npm install --no-save --package-lock=false /path/to/comic-dl-3.0.0-alpha.tgz` in this repository.

Inspect an extension's package independently:

```sh
npm pack --workspace @comic-dl/zerobyw
```

## Publish to npm

Bump an extension with `npm version <version> --workspace @comic-dl/zerobyw --no-git-tag-version` and commit its `package.json` along with the root `package-lock.json`. The release workflow checks the repository on pushes to `main`, but only packages and publishes extensions whose versions changed. Prereleases use `next`, stable releases use `latest`, and existing versions are skipped.

Once the workflow is on `main`, configure a separate [GitHub Actions trusted publisher](https://docs.npmjs.com/trusted-publishers/) for each npm package. Use owner `yinyanfr`, repository `comic-dl-extensions`, and workflow filename `publish-npm.yml`. Leave the environment blank and allow direct publishing (`npm publish`). No npm token is needed. A new trusted publisher must complete its first successful publish within two days. Publish the first version of a brand-new package manually before configuring its trusted publisher.
