# Publish extensions to npm

[简体中文](releasing.md)

From the repository root, bump the version of the extension you want to publish. For example, to bump Zerobyw's patch version:

```sh
npm version patch --workspace @comic-dl/zerobyw --no-git-tag-version
```

You can also replace `patch` with an exact version. Commit the extension's `package.json` and the root `package-lock.json`. A push to `main` that modifies `extensions/*/package.json` triggers the [release workflow](../.github/workflows/publish-npm.yml). The workflow compares versions before and after the entire push. If any versions changed, it runs repository-wide checks and packages and publishes only the affected extensions. Prereleases use `next`, stable releases use `latest`, and versions already on npm are skipped at the publish step.
