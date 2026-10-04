# MCP Servers: What You Can Do

MCP servers let an MCP-compatible AI client call focused tools. The servers in this project are read-only connectors for Irish public data and project guidance.

## Usage map

The [README](../README.md#how-it-fits-together) shows this flow as a diagram. Connect an MCP client, then either search the live catalogue with `data-gov-ie` or read an API reference through `project-docs`. Dashed "or" links are alternatives, not a required order.

| Box | Opens |
| --- | --- |
| MCP client | [Run locally](#run-locally) |
| project-docs | [Available now: `project-docs`](#available-now-project-docs) |
| data-gov-ie | [Available now: `data-gov-ie`](#available-now-data-gov-ie) |
| data.gov.ie | [apis/data-gov-ie.md](apis/data-gov-ie.md) |
| Dublinked | [apis/dublinked.md](apis/dublinked.md) |
| CSO PxStat | [apis/cso-pxstat.md](apis/cso-pxstat.md) |
| NTA / TFI | [apis/nta-tfi.md](apis/nta-tfi.md) |
| EirGrid | [apis/eirgrid.md](apis/eirgrid.md) |
| EPA | [apis/epa.md](apis/epa.md) |
| Met Éireann | [apis/met-eireann.md](apis/met-eireann.md) |

The interactive version, where clicking a box opens its document, is [`diagrams/usage-map.html`](diagrams/usage-map.html): open it in a browser from a local clone, or serve it with GitHub Pages. To change the map, edit `diagrams/usage-map.workflow.json`, re-render with Archify, then run `node docs/diagrams/add-links.mjs`.

## Available now: `data-gov-ie`

This server searches the official [data.gov.ie](https://data.gov.ie/) catalog and inspects dataset records. It needs no API key. It returns catalog metadata and links; it does not download or analyze the linked data for you.

| Tool | What it does | Inputs |
| --- | --- | --- |
| `search_datasets` | Searches by topic, place, or keyword. Returns matches with summaries, publisher, license, metadata dates, tags, and resource links/formats. | `query` (2–200 characters); optional `limit` (1–25, default 10). |
| `get_dataset` | Looks up one dataset from its ID or URL name. Returns its metadata and available resource links/formats. | `id` (dataset ID or URL name, usually copied from a search result). |

### Things you can ask an MCP client

- “Find Irish datasets about bus stops in Dublin and show the licenses and download formats.”
- “Find datasets about housing retrofits in Cork, then inspect the most relevant one.”
- “What data is available about river water quality? Show the publisher and source links.”
- “Compare the metadata dates and resource formats for these two dataset records.”

These are discovery and inspection tasks. After finding a dataset, open its source/resource link to check its geographic coverage, time period, license terms, and whether the actual data suits your question. The catalog may be stale, and a listed resource can live on a publisher's site.

### Example from a live catalog lookup

Searching for `Dublin bus stops` returned 38 catalog matches. Among the first five were CSO tables about Dublin Bus and Bus Éireann passenger flows, plus South Dublin County Council's **Luas Stops** dataset. Looking up `luas-stops` returned its publisher, CC BY 4.0 license, and links in CSV, GeoJSON, KML, shapefile, and ArcGIS service formats. This is an example of what the tools return, not a claim that these records are complete or current; check the [Luas Stops catalog record](https://data.smartdublin.ie/dataset/luas-stops) and its resources before use.

## Available now: `project-docs`

This server reads and searches this repository's project guidance. It is limited to approved documentation paths: `README.md`, `AGENTS.md`, and Markdown files under `docs/`. Source code, configuration, environment files, and symlinks are never exposed. Each approved document is also published as an MCP resource (`project-docs:///<path>`).

| Tool | What it does | Inputs |
| --- | --- | --- |
| `list_docs` | Lists the approved documents with path, title, and size. | None. |
| `read_doc` | Returns one approved document's text. | `path` (a path from `list_docs`, such as `docs/apis/epa.md`). |
| `search_docs` | Finds lines containing every word of the query, case-insensitive. Returns the document path, line number, and nearest heading. | `query` (2–200 characters); optional `limit` (1–50, default 10). |

### Things you can ask an MCP client

- “Which MCP servers are planned, and what makes each one ready to release?”
- “Search the project docs for CSO and summarize where it is mentioned.”

- “How do I query a CSO table for one month only?”
- “Which EPA APIs exist, and which one covers bathing water?”
- “Does the TFI realtime API need a key, and how often can I call it?”

### API references served by `project-docs`

`docs/apis/` holds one reference per data provider. Each has the same sections: overview, authentication, endpoints, datasets, formats, licence and attribution, rate limits and update cadence, known gotchas, and source links.

| Document | Provider |
| --- | --- |
| [`docs/apis/data-gov-ie.md`](apis/data-gov-ie.md) | data.gov.ie national catalogue (CKAN) |
| [`docs/apis/dublinked.md`](apis/dublinked.md) | Dublinked / Smart Dublin (CKAN and DataStore) |
| [`docs/apis/cso-pxstat.md`](apis/cso-pxstat.md) | CSO PxStat statistical tables |
| [`docs/apis/nta-tfi.md`](apis/nta-tfi.md) | NTA/TFI GTFS and GTFS-Realtime |
| [`docs/apis/eirgrid.md`](apis/eirgrid.md) | EirGrid Smart Grid Dashboard |
| [`docs/apis/epa.md`](apis/epa.md) | EPA open data APIs, map layers, and HydroNet |
| [`docs/apis/met-eireann.md`](apis/met-eireann.md) | Met Éireann forecasts, warnings, and observations |

The references were checked against the live services on 2026-10-04. Dataset counts and endpoints change; each file marks what was not verified.

The document list is read when the server starts; restart it after adding a new file under `docs/`.

## Planned MCP servers

These are roadmap items in the [MCP release plan](mcp-release-plan.md); they are not available as tools yet.

| Planned server | Intended use |
| --- | --- |
| `cso-statistics` | Discover CSO PxStat tables and retrieve bounded statistical queries with dimensions and source metadata. |
| `dublinked` | Search Dublin's transport, amenities, and infrastructure catalog. |
| `epa-environment` | Find EPA environmental and water data with reporting-period metadata. |
| `met-eireann` | Retrieve weather observations, forecasts, and warnings with valid and issue times. |
| `eirgrid-energy` | Access electricity demand and generation data with units and time intervals. |
| `transport-tfi` | Discover TFI/NTA timetables, with real-time access only where the official API permits it. |

## Run locally

From the repository root, use Node.js 20 or later:

```sh
npm install
npm run dev               # data-gov-ie
npm run dev:project-docs  # project-docs
```

Configure your MCP client to launch `npm run dev` (or `npm run dev:project-docs`) in this repository. Each server communicates over stdio. See the [release plan](mcp-release-plan.md) for implementation details and client setup notes.
