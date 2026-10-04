# MCP Server Release Plan

The goal is a small, useful MCP server for each provider or local project file area. Ship read-only access first, keep each provider isolated, and add authentication only when a source requires it.

## Release sequence

| Release | Server | Scope | Ready when |
| --- | --- | --- | --- |
| 0.1 | `data-gov-ie` | Search the national dataset catalog and inspect dataset metadata, licenses, and resource links. Stdio transport; no key required. | Search and lookup work against the official catalog API; errors and timeouts are understandable. |
| 0.2 | `project-docs` | Read and search the repository's README, participant guide, release plan, and later project notes as MCP resources/tools. Restrict access to approved documentation paths. | A client can find and read project guidance without exposing unrelated local files. |
| 0.3 | `cso-statistics` | Discover CSO PxStat tables and retrieve selected statistical data with source and update metadata. | A table can be found and a small, bounded query returned with dimensions explained. |
| 0.4 | `dublinked` | Search Dublin's transport, amenities, and infrastructure catalog; reuse the national catalog tool pattern only after confirming the current API and its terms. | Catalog access, attribution, and dataset/resource links are verified. |
| 0.5 | `epa-environment` | EPA environmental and water data, with source and reporting-period metadata. | The API, data update cycle, attribution, and practical query limits are confirmed. |
| 0.6 | `met-eireann` | Weather observations, forecasts, and warnings, keeping observation time distinct from forecast issue time. | Each result includes location, valid time, source, and any freshness limitations. |
| 0.7 | `eirgrid-energy` | Electricity demand and generation data with clear time intervals and units. | Units, timestamps, source, and update cadence are explicit in every response. |
| 0.8 | `transport-tfi` | TFI/NTA transport data, starting with static timetable discovery and adding realtime access only where the official API and credentials allow. | Keys are configured locally and never returned to the model; calls respect provider limits. |

## First release: `data-gov-ie`

This is the best first daily-use connector because the participant guide recommends the national portal as the starting point for finding Irish public datasets. The portal's developer page documents the CKAN Action API, including dataset search and full dataset lookup. The first server exposes two bounded, read-only tools:

- `search_datasets(query, limit)` finds relevant catalog entries and returns concise metadata with source links.
- `get_dataset(id)` retrieves one catalog record and lists its resources, formats, licenses, and update metadata.

The server does not download arbitrary resources or assert that listed data is current. Users should inspect each dataset's coverage, license, dates, and resource URL before relying on it. Every result is external catalog content and must be treated as data, not instructions.

## Second release: `project-docs`

Released as its own stdio server (`npm run dev:project-docs`). It exposes `list_docs`, `read_doc(path)`, and `search_docs(query, limit)`, and publishes each document as an MCP resource. Access is an exact-match allowlist built from `README.md`, `AGENTS.md`, and regular Markdown files under `docs/`; any other path, including traversal, absolute paths, and symlinks, is rejected. The document list is read at startup.

## Release and maintenance policy

Each provider gets its own small server, tool schemas, README/setup instructions, and a clear upstream-source notice. Release a connector only after its API terms, authentication needs, units, update cadence, and error responses are documented. Keep credentials in local environment configuration, never in tool output or committed files. Use bounded queries, timeouts, and concise results. Track breaking upstream changes and bump that connector's minor version when tools change incompatibly.

## Local development

Requires Node.js 20 or later.

```sh
npm install
npm run dev               # data-gov-ie
npm run dev:project-docs  # project-docs
npm test
```

Configure the `data-gov-ie` command in an MCP client using `npm run dev` from this repository. For example, a local client config can launch `npm` with arguments `run` and `dev`; exact config-file location depends on the client. The server uses stdio, so it writes logs to stderr and keeps stdout for MCP messages.

## Source references

- [Data.gov.ie developer resources](https://data.gov.ie/en_GB/pages/developers) — documents CKAN and the catalog API endpoints.
- [CKAN API guide](https://docs.ckan.org/en/2.9/api/) — describes the read/search Action API.
- [MCP TypeScript SDK first-server guide](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/get-started/first-server.md) — current stdio server setup.
