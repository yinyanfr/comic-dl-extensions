# CopyManga

[简体中文](README.md)

`@comic-dl/copymanga` adds CopyManga to [comic-dl](https://github.com/yinyanfr/comic-dl). Search, list chapters, and download CBZ archives without signing in. Searches use `www.copy20.com`, and downloads use the “熱辣漫畫” Line 2 endpoint.

## Usage

### Search and download

Install the CLI with Node.js 24:

```sh
npm install -g comic-dl@latest
comic-dl add @comic-dl/copymanga
comic-dl search 'Do It Yourself' --source copymanga

series_url='https://www.copy20.com/comic/doityourself'
comic-dl list "$series_url"
comic-dl download "$series_url" -c 1-2 -o ./downloads
```

This downloads the first two chapters in the selected group. The default group is `default`. If the series offers a collected-volume group, append `?group=tankobon` to its URL.

### Runtime settings and catalog filters

These features require `@comic-dl/copymanga` 0.2.0 and `comic-dl` 3.2.0 or later:

```sh
comic-dl sources --source copymanga --options
comic-dl list doityourself --source copymanga --set copymanga.api-url=https://api.manga2025.com
```

- `site-url` (default `https://www.copy20.com`): keyword search, catalog browsing, and generated series links.
- `api-url` (default `https://api.manga2025.com`): the API for listing and reading chapters.
- `api-user-agent`: User-Agent for chapter API requests. Only printable ASCII is accepted.

Both URLs must be HTTPS origins with no path, query, fragment, or credentials. To save settings, put them under `sourceSettings.copymanga` in the [CLI config](https://yinyanfr.github.io/comic-dl/en/reference/config/).

Omit the keyword to browse the catalog. `--options` shows sort and filter IDs, including theme IDs fetched from the site:

```sh
comic-dl search --source copymanga --options
comic-dl search --source copymanga --sort popular --filter status=completed --filter region=japan
comic-dl search --source copymanga --sort popular --filter status=completed --filter region=japan --page 2
```

The default sort is most recently updated (`updated`). You can also choose `oldest-updated` or `popular`. Filter keys are `theme`, `region`, and `status`. Keyword search keeps the site's search order and does not support catalog filters.
