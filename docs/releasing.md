# 发布扩展到 npm

[English](releasing.en.md)

在仓库根目录更新要发布的扩展版本。例如，给 Zerobyw 升一个补丁版本：

```sh
npm version patch --workspace @comic-dl/zerobyw --no-git-tag-version
```

也可以用具体版本号替换 `patch`。在 [Changelog](../CHANGELOG.md) 中添加英文发布条目，列出每个受影响的 npm 包及其确切版本，把随本次发布交付的改动从 `Unreleased` 移入该条目。将 changelog、扩展的 `package.json` 和根目录的 `package-lock.json` 一起提交。

修改 `extensions/*/package.json` 后推送到 `main`，会触发[发布工作流](../.github/workflows/publish-npm.yml)。工作流对比整次推送前后的版本；如果有版本变化，就运行全仓库检查，仅为版本有变化的扩展打包和发布。预发布使用 `next`，正式版使用 `latest`，npm 上已有的版本会跳过发布。
