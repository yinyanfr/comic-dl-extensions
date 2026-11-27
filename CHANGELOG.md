# Changelog

Each extension is versioned independently. Entries group packages released from the same commit; dates are npm publication dates in UTC. For future releases, list each affected package and its exact version. Keep changes that have not shipped in a package under **Unreleased**.

## Metadata, protected covers, and canonical chapter context — 2026-11-28

These versions target the public `comic-dl@4.0.0` backend APIs while retaining extension API v1.

- **`@comic-dl/copymanga@0.3.0`:** Return optional titles, authors, summaries, themes, and public cover URLs. Associate direct chapters with their series and selected `group` so the core preserves full-catalog numbering.
- **`@comic-dl/zerobyw@0.3.0`:** Extract optional page-provided metadata and public covers. Resolve direct chapters through the current site's canonical series catalog without changing Cookie origin binding or anonymous image requests.
- **`@comic-dl/komga@0.3.0`:** Return series metadata and opaque cover IDs. Read protected thumbnails through a source-constrained server endpoint, never exposing API keys. Associate direct book links with their series catalog.
- **`@comic-dl/kavita@0.3.0`:** Return optional series/detail metadata and opaque cover IDs. Read protected covers on the bound server without returning Auth Key URLs, and associate direct chapters with the series catalog.
- **`@comic-dl/dm5@0.2.0`:** Extract optional titles, authors, summaries, tags, and public covers. Use reader-provided series links for canonical positions without exposing image signing queries.

### Development and documentation

- Pin development to the published `comic-dl@4.0.0`, using public `comic-dl/extension` types without local compatibility declarations. Verify metadata, authenticated covers, direct-link identity, and readable archives with 19 offline tests.
- Preserve the preceding repository maintenance: public-API tests for CopyManga settings, URL matching, dynamic themes, and pagination; updated Zerobyw CLI diagnostics; complete English release history and bilingual publishing guidance.
- Document the core-first publishing sequence and link all five packages to the bilingual core task/archive API guides.

## Runtime settings and catalog filters — 2026-11-27

The features below require `comic-dl` 3.2.0 or later. See the [source settings reference](https://yinyanfr.github.io/comic-dl/en/reference/config/) and the individual extension READMEs for configuration and authentication.

- **`@comic-dl/copymanga@0.2.0`:** Make the website, chapter API, and chapter API User-Agent configurable. Browse by update time or popularity, filter by theme, region, or status, and paginate the filtered results. Theme choices come from the website. Keyword searches retain the site's ordering, and `?group=` still selects the chapter group.
- **`@comic-dl/zerobyw@0.2.0`:** Make the website and image origins configurable. Resolve links from the built-in site or an explicitly configured previous site on the current site without changing the IDs. Bind the login Cookie to the configured website origin with `COMIC_DL_ZEROBYW_COOKIE_ORIGIN`; search and image requests remain anonymous.
- **`@comic-dl/komga@0.2.0`:** Add the `server-url` setting. Bind the API key to the full server URL, including any reverse-proxy path, with `COMIC_DL_KOMGA_API_KEY_URL`. Fall back to `COMIC_DL_KOMGA_URL` for the binding when the new variable is unset.
- **`@comic-dl/kavita@0.2.0`:** Add the `server-url` setting and bind the Auth Key to the full server URL with `COMIC_DL_KAVITA_API_KEY_URL`, falling back to `COMIC_DL_KAVITA_URL` for the binding when unset.

[Source commit](https://github.com/yinyanfr/comic-dl-extensions/commit/4a68a7d) · [npm publish run](https://github.com/yinyanfr/comic-dl-extensions/actions/runs/45948258966)

## Automated patch releases — 2026-11-26

- **`@comic-dl/copymanga@0.1.2`, `@comic-dl/dm5@0.1.1`, `@comic-dl/kavita@0.1.1`, `@comic-dl/komga@0.1.1`:** Publish patch versions using the automated workflow. The version-bump commit contains no source adapter changes for these packages.
- Move the publishing instructions out of the root READMEs into dedicated English and Simplified Chinese guides.

[Source commit](https://github.com/yinyanfr/comic-dl-extensions/commit/ea597f1) · [npm publish run](https://github.com/yinyanfr/comic-dl-extensions/actions/runs/45851112696)

## Zerobyw chapter title fix — 2026-11-26

- **`@comic-dl/zerobyw@0.1.2`:** Download chapters whose reader metadata has an empty title. Use the reader breadcrumb title when available and the chapter ID as the fallback.
- Add the npm publishing workflow. A push to `main` that changes package manifests checks the repository and publishes only packages whose versions changed. Stable versions use `latest`, prereleases use `next`, and already published versions are skipped.

[Fix and workflow](https://github.com/yinyanfr/comic-dl-extensions/commit/05361f4) · [Version bump](https://github.com/yinyanfr/comic-dl-extensions/commit/b46f8d0) · [npm publish run](https://github.com/yinyanfr/comic-dl-extensions/actions/runs/45848734351)

## DM5, Komga, and Kavita join the repository — 2026-11-26

- **`@comic-dl/dm5@0.1.0`:** Search, list, and download public DM5 chapters. Accept Manhuaren links and use the same CBZ for the same chapter from either site.
- **`@comic-dl/komga@0.1.0`:** Connect to a self-hosted Komga library with an API key. Search series, list books in reading order, and save each book as a CBZ using the server's page API.
- **`@comic-dl/kavita@0.1.0`:** Connect to a self-hosted Kavita library with an Auth Key. Search series, list chapters and specials across volumes, and download page images into CBZ archives.
- **`@comic-dl/copymanga@0.1.1`, `@comic-dl/zerobyw@0.1.1`:** Add bilingual package documentation and include `README.en.md` in the npm packages.
- Add an English repository README and offline tests for the three new sources.

[Source commit](https://github.com/yinyanfr/comic-dl-extensions/commit/af0a4c3)

## First source releases — 2026-11-26

- **`@comic-dl/copymanga@0.1.0`:** Search and browse anonymously, list chapters from the selected group, and download series or individual chapters as CBZ archives. Search uses the public website; chapter reads use the Line 2 API.
- **`@comic-dl/zerobyw@0.1.0`:** Search the public catalog and use a login Cookie to list and download readable chapters. Support direct chapter links and report VIP-only chapters as restricted.
- Initialize the repository with the MIT license, then add the Node.js 24 TypeScript workspace, offline source fixtures, and GitHub Actions CI.

[Initial commit](https://github.com/yinyanfr/comic-dl-extensions/commit/f6e77cb) · [Source import](https://github.com/yinyanfr/comic-dl-extensions/commit/b1b6a6a)

## npm staging placeholders — 2026-11-26

`@comic-dl/copymanga@0.0.0-stage`, `@comic-dl/dm5@0.0.0-stage`, `@comic-dl/kavita@0.0.0-stage`, `@comic-dl/komga@0.0.0-stage`, and `@comic-dl/zerobyw@0.0.0-stage` were temporary npm placeholders for staged publishing. They did not contain source adapters or correspond to version bumps in Git.
