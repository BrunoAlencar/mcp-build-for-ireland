# MCP Servers: What You Can Do

MCP servers let an MCP-compatible AI client call focused tools. The servers in this project are read-only connectors for Irish public data and project guidance.

## Usage map

The [README](../README.md#how-it-fits-together) shows this flow as a diagram. Connect an MCP client, then query a source live through its server, or read its API reference through `project-docs`. Dashed "or" links are alternatives, not a required order.

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

## Available now: `dublinked`

Searches the [Dublinked](https://data.smartdublin.ie/) catalogue of the four Dublin local authorities and reads rows from datasets held in its DataStore. No key. Reference: [apis/dublinked.md](apis/dublinked.md).

| Tool | What it does | Inputs |
| --- | --- | --- |
| `search_datasets` | Searches the Dublin catalogue. | `query`; optional `limit` (1–25). |
| `get_dataset` | Returns one dataset with its resources and whether each is in the DataStore. | `id`. |
| `query_resource` | Reads rows from a DataStore resource. | `resourceId`; optional `query`, `filters`, `limit` (1–100), `offset`. |

## Available now: `cso-statistics`

Finds CSO PxStat tables and reads values as labelled rows with units. No key. Reference: [apis/cso-pxstat.md](apis/cso-pxstat.md).

| Tool | What it does | Inputs |
| --- | --- | --- |
| `search_tables` | Searches table codes, titles, and dimension names, newest first. The first call downloads the table list and takes a few seconds. | `query`; optional `limit` (1–50). |
| `get_table` | Lists a table's dimensions with category codes, labels, and units. | `table` (such as `EIIA13`). |
| `query_table` | Returns values as rows. Queries over 5,000 cells are refused; add filters. | `table`; optional `filters` (dimension code to category codes), `limit` (1–500). |

## Available now: `epa-environment`

Reads EPA Water Framework Directive status and bathing water quality. No key. Reference: [apis/epa.md](apis/epa.md).

| Tool | What it does | Inputs |
| --- | --- | --- |
| `search_water_bodies` | Finds rivers, lakes, coastal waters, and catchments by name. | `query`; optional `limit` (1–50), `page`. |
| `get_water_body` | Returns ecological status, the elements behind it, risk, and location for recent assessment periods. | `code`; optional `periods` (1–6). |
| `list_bathing_waters` | Lists monitored beaches and lakes with their current classification. | Optional `county`, `name`, `limit` (1–100). |
| `list_bathing_alerts` | Lists current bathing incidents and restrictions. | None. |

Water status is assessed over multi-year periods; it is not a live reading.

## Available now: `met-eireann`

Reads Met Éireann forecasts, warnings, and observations. No key. Reference: [apis/met-eireann.md](apis/met-eireann.md).

| Tool | What it does | Inputs |
| --- | --- | --- |
| `get_point_forecast` | Hourly forecast for one point, with the model run time kept separate from each hour's valid time (UTC). | `latitude` (51–56), `longitude` (-11 to -5); optional `hours` (1–72). |
| `get_text_forecast` | The written forecast and when it was issued. | Optional `region` (National, Outlook, Dublin, or a province). |
| `get_weather_warnings` | Warnings in force, with level, onset, and expiry. An empty list means none. | None. |
| `get_latest_observations` | The latest hourly measurement from each station. Wind is in knots. | Optional `station`. |

## Available now: `eirgrid-energy`

Reads electricity system data from EirGrid's Smart Grid Dashboard. No key. Reference: [apis/eirgrid.md](apis/eirgrid.md).

| Tool | What it does | Inputs |
| --- | --- | --- |
| `get_system_data` | One series for one day, with a per-field summary (min, max, mean, latest) and recent readings. | `series` (demand, generation, wind, solar, their forecasts, co2_intensity, co2_emissions, interconnection, frequency, snsp, fuel_mix); optional `region` (ALL, ROI, NI), `date` (YYYY-MM-DD), `limit` (1–400). |

This is the endpoint behind the dashboard, not a documented API; it can change without notice. Responses carry no units, so the unit shown is the dashboard's label.

## Available now: `transport-tfi`

Lists TFI timetable files and, with a key, reads live bus data from the NTA. Reference: [apis/nta-tfi.md](apis/nta-tfi.md).

| Tool | What it does | Inputs |
| --- | --- | --- |
| `list_gtfs_feeds` | Lists the static GTFS timetable files with size and last-modified time. No key. It does not open the files. | Optional `operator`. |
| `get_trip_updates` | Live delays and cancellations for Dublin Bus, Bus Éireann, and Go-Ahead Ireland. Needs a key. | Optional `routeId`, `stopId`, `limit` (1–50). |
| `get_vehicle_positions` | Live vehicle positions for the same operators. Needs a key. | Optional `routeId`, `limit` (1–100). |

The two live tools need `NTA_API_KEY` in the server's environment; see `.env.example`. Register at the [NTA developer portal](https://developer.nationaltransport.ie/). The key is never returned in tool output, and live results are cached for 60 seconds to respect the NTA limit of one call per minute. The live tools have not been run against the real API, because no key was available when they were built.

### Things you can ask an MCP client

- “What share of Irish rivers had high or good ecological status in the latest period?”
- “What is the water quality status of the River Dodder?”
- “Which Dublin beaches have a swim restriction right now?”
- “What is the forecast for Galway for the next six hours, and are any warnings in force?”
- “How much wind generation was there yesterday compared with demand?”
- “Where are the Dublinbikes stations?”

## Run locally

From the repository root, use Node.js 20 or later:

```sh
npm install
npm run dev               # data-gov-ie
npm run dev:project-docs  # project-docs
npm run dev:dublinked     # dublinked
npm run dev:cso           # cso-statistics
npm run dev:epa           # epa-environment
npm run dev:met           # met-eireann
npm run dev:eirgrid       # eirgrid-energy
npm run dev:tfi           # transport-tfi
```

`.mcp.json` registers all eight servers for MCP clients that read it, such as Claude Code. For other clients, configure each server to launch its `npm run dev:…` command in this repository. Each server communicates over stdio. See the [release plan](mcp-release-plan.md) for scope and limits.
