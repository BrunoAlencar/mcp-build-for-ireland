# data.gov.ie API Reference

Ireland's national open data portal. It is a catalogue: it describes datasets and links to files hosted by publishers. Verified against the live API on 2026-10-04.

## Overview

| Item | Value |
| --- | --- |
| Base URL | `https://data.gov.ie/api/3/action` |
| Platform | CKAN 2.9.16 (Action API v3) |
| Catalogue size | 22,762 datasets from 172 organisations |
| Metadata standard | DCAT-AP |
| Method | `GET`, JSON responses |

Every response is an envelope: `{"help": ..., "success": true, "result": ...}`. On failure `success` is `false` and `error` carries a message.

## Authentication

None. All read actions are anonymous. No API key is needed.

## Endpoints

| Action | Purpose | Example |
| --- | --- | --- |
| `package_search` | Full-text search with filters, facets, and paging. | `/package_search?q=bus+stops&rows=5` |
| `package_show` | One dataset with all its resources. | `/package_show?id=nta-gtfs` |
| `package_list` | Every dataset name (large response). | `/package_list` |
| `organization_list` | Publisher names (172). | `/organization_list` |
| `tag_list` / `tag_show` | Tags (22,889) and datasets for one tag. | `/tag_show?id=marine` |
| `resource_search` | Search resources by field. | `/resource_search?query=name:Luas` |
| `license_list` | Licence identifiers and URLs. | `/license_list` |
| `status_show` | CKAN version and enabled extensions. | `/status_show` |

Useful `package_search` parameters:

- `q` — free text. `fq` — filter, such as `fq=organization:fingal-county-council` or `fq=res_format:GEOJSON`.
- `rows` (page size) and `start` (offset) for paging. `sort`, such as `metadata_modified desc`.
- `facet.field=["organization","res_format","license_id","tags"]` with `rows=0` returns counts only.

Bulk catalogue feeds (all returned HTTP 200):

- `https://data.gov.ie/catalog.rdf` — DCAT RDF/XML, paged with `?page=N`.
- `https://data.gov.ie/catalog.jsonld?page=1` — DCAT JSON-LD.
- `https://data.gov.ie/dcat.json` — DCAT JSON.

## Datasets

The catalogue is too large to list. Enumerate it live:

```
https://data.gov.ie/api/3/action/package_search?rows=0&facet.field=["organization","res_format","license_id"]&facet.limit=200
```

Largest publishers (dataset counts on 2026-10-04):

| Publisher (`organization` value) | Datasets |
| --- | --- |
| Central Statistics Office (`central-statistics-office`) | 12,915 |
| Met Éireann (`meteireann`) | 2,051 |
| Tusla (`tusla`) | 1,492 |
| Marine Institute (`marine-institute`) | 1,053 |
| Department of Housing, Local Government and Heritage | 605 |
| Environmental Protection Agency (`environmental-protection-agency`) | 451 |
| Department of Health (`department-of-health`) | 445 |
| Fingal County Council (`fingal-county-council`) | 420 |
| South Dublin County Council (`south-dublin-county-council`) | 233 |
| Health Research Board (`health-research-board`) | 200 |
| Tailte Éireann (`tailte-eireann`) | 192 |
| Dublin City Council (`dublin-city-council`) | 161 |

Datasets for common themes:

| Theme | Dataset name (use with `package_show`) | Publisher | Formats |
| --- | --- | --- | --- |
| Transport | `nta-gtfs` — NTA GTFS and GTFS Realtime | National Transport Authority | ZIP, CSV, REST |
| Transport | `national-public-transport-access-nodes-naptan` — stop locations | National Transport Authority | CSV, JSON, XML |
| Transport | `cycle-counters` | National Transport Authority | ZIP |
| Housing / retrofit | `ebq02-domestic-building-energy-ratings` | Central Statistics Office | CSV, XLSX, JSON-stat, PX |
| Housing / retrofit | `local-government-housing-units-retrofitted-2024-for-all-local-authorities` | LGMA | XLSX |
| Housing / planning | `planning-application-sites6` | Dept of Housing | CSV, GeoJSON, GPKG, ArcGIS REST |
| Housing / planning | `wicklow-derelict-sites-register` | Wicklow County Council | CSV, GeoJSON, KML, SHP |
| Reuse / repair | `recycling-centres-in-dlr` | Dún Laoghaire-Rathdown | CSV, GeoJSON, SHP, WMS |
| Reuse / repair | `weee-recycling-centres-fcc3` | Fingal County Council | CSV, GeoJSON, KML |
| Environment | `air-quality-index-regions` | EPA | JSON, WMS |
| Environment | `inspire-air-quality-data-hvd` | EPA | XML |
| Weather | `weather-warnings`, `met-eireann-forecast-api` | Met Éireann | JSON, XML |

Match counts for sample searches: "building energy rating" 248, "planning applications" 197, "air quality" 77, "recycling centres" 18, "derelict sites" 14, "cycle counter" 12, "retrofit" 8.

## Formats

Resource formats by count: CSV 20,357; XLSX 14,335; JSON-stat 13,901; PX 13,901; HTML 3,059; TXT 2,227; JSON 1,873; ZIP 1,218; GeoJSON 1,183; KML 1,165; ArcGIS REST 1,001; WMS 579; PDF 403.

## Licence and attribution

The portal requires at least Creative Commons Attribution (CC BY). Licence counts: CC-BY-4.0 22,011; CC-BY-SA-4.0 433; cc-by-nc-nd 56; cc-zero 28; not specified 28; Met Éireann custom (`me-custom`) 4. Credit the publishing organisation named on the dataset, not data.gov.ie.

## Rate limits and update cadence

No rate limit is documented. Harvesters pull records from publisher portals (CSO, Dublinked, ArcGIS hubs), so a record's `metadata_modified` reflects the harvest, not necessarily a data change.

## Known gotchas

- **Overlap.** CSO tables and Dublinked datasets also appear here. The same data can show up under two portals.
- **Format labels are inconsistent.** `CSV`, `csv`, and `.csv` are separate values; so are `GeoJSON` and `GEOJSON`.
- **Resource links can be dead or point to a web page.** `HTML` resources are landing pages, not data.
- **Some records have an empty title** (for example `weather-warnings`). Fall back to `name`.
- **DataStore.** The `datastore` extension is enabled, but a `datastore_search` probe returned HTTP 409. Row-level queries are not confirmed to work here; download the resource file instead.
- **No themes facet.** The only group is `haleandhearty` (431 datasets). Use tags or organisation to browse.

## Source links

- [Developer resources](https://data.gov.ie/en_GB/pages/developers)
- [CKAN 2.9 API guide](https://docs.ckan.org/en/2.9/api/)
- [Catalogue home](https://data.gov.ie/)
