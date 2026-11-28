<p align="center">
  <img src="assets/readme-icon.svg" alt="comic-dl-extensions icon: a comic book and extension puzzle piece" width="144" height="144" />
</p>

<h1 align="center">comic-dl-extensions</h1>

<p align="center">
  <strong>More sources. One library.</strong><br />
  Manga sources for the comic-dl CLI, library, and Web UI<br />
  Install independently · Version independently · One extension API
</p>

<p align="center">
  <a href="https://github.com/yinyanfr/comic-dl"><img src="https://img.shields.io/badge/comic--dl-4.x-0F766E?style=flat-square" alt="Targets comic-dl 4.x" /></a>
  <a href="https://yinyanfr.github.io/comic-dl/en/extensions/develop/"><img src="https://img.shields.io/badge/Extension_API-v1-5276A3?style=flat-square" alt="Extension API v1" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-24-5FA04E?style=flat-square&amp;logo=nodedotjs&amp;logoColor=white" alt="Node.js 24" /></a>
  <a href="https://github.com/yinyanfr/comic-dl-extensions/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/yinyanfr/comic-dl-extensions/ci.yml?branch=main&amp;style=flat-square&amp;label=CI" alt="CI status" /></a>
  <a href="https://github.com/yinyanfr/comic-dl-extensions/actions/workflows/publish-npm.yml"><img src="https://img.shields.io/github/actions/workflow/status/yinyanfr/comic-dl-extensions/publish-npm.yml?branch=main&amp;style=flat-square&amp;label=Publish" alt="npm publishing status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-A96927?style=flat-square" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="#sources">Sources</a> ·
  <a href="#install">Install</a> ·
  <a href="https://github.com/yinyanfr/comic-dl">Core project</a> ·
  <a href="https://github.com/yinyanfr/comic-dl-web">Web UI</a> ·
  <a href="CHANGELOG.md">Changelog</a> ·
  <a href="README.md">简体中文</a>
</p>

## Sources

This repository maintains manga source extensions for [comic-dl](https://github.com/yinyanfr/comic-dl). Each extension is packaged and versioned independently, so you can install just the sources you need.

| Extension                                      | npm package           | Source ID   |
| ---------------------------------------------- | --------------------- | ----------- |
| [CopyManga](extensions/copymanga/README.en.md) | `@comic-dl/copymanga` | `copymanga` |
| [Zerobyw](extensions/zerobyw/README.en.md)     | `@comic-dl/zerobyw`   | `zerobyw`   |
| [DM5 / Manhuaren](extensions/dm5/README.en.md) | `@comic-dl/dm5`       | `dm5`       |
| [Komga](extensions/komga/README.en.md)         | `@comic-dl/komga`     | `komga`     |
| [Kavita](extensions/kavita/README.en.md)       | `@comic-dl/kavita`    | `kavita`    |

## Install

Use Node.js 24 to install the CLI and add the extension you want. For example:

```sh
npm install -g comic-dl@latest
comic-dl add @comic-dl/copymanga
```

Current versions are CopyManga, Komga, and Kavita `0.3.0`, Zerobyw `0.3.1`, and DM5 `0.2.1`. Their complete metadata, cover, and chapter-context features use `comic-dl` 4.x. If an older saved range excludes the new minor version, rerun `comic-dl add @comic-dl/copymanga@latest` with the appropriate package name. `comic-dl update` still respects saved ranges.

Each extension's README covers its settings, authentication, and commands. To register extensions directly from Node.js, see the [library guide](https://yinyanfr.github.io/comic-dl/en/guide/library/).

See the [changelog](CHANGELOG.md) for release history by package version.

## Use with the Web UI

Prefer browsing sources, downloading manga, and managing your shelf and automatic updates in a browser? See [comic-dl-web](https://github.com/yinyanfr/comic-dl-web), an independent, self-hosted Web UI for NAS and local collections. These extensions handle source parsing and authentication; the Web UI uses them through public core APIs. See the Web repository for installation, configuration, and deployment.

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
