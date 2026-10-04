# Dublinked (Smart Dublin) API Reference

The open data portal for the four Dublin local authorities. Like data.gov.ie it is a CKAN catalogue, but it also hosts row-level data and a few live APIs. Verified against the live API on 2026-10-04.

## Overview

| Item | Value |
| --- | --- |
| Base URL | `https://data.smartdublin.ie/api/3/action` |
| Platform | CKAN 2.9.16 (Action API v3) |
| Catalogue size | 935 datasets from 13 organisations |
| Method | `GET`, JSON responses |

## Authentication

None for the catalogue or the DataStore. Some linked third-party APIs need their own key (for example the JCDecaux Dublinbikes API).

## Endpoints

The catalogue actions are the same as [data.gov.ie](data-gov-ie.md): `package_search`, `package_show`, `organization_list`, `tag_list`, `status_show`.

```
https://data.smartdublin.ie/api/3/action/package_search?q=recycling&rows=5
https://data.smartdublin.ie/api/3/action/package_show?id=dublinbikes-api
```

**DataStore (row-level queries).** Works here. Use the `id` of a resource whose `datastore_active` is `true`:

```
https://data.smartdublin.ie/api/3/action/datastore_search?resource_id=2dec86ed-76ed-47a3-ae28-646db5c5b965&limit=5
```

That call returns Dublinbikes station rows (`Number`, `Name`, `Address`, `Latitude`, `Longitude`). Parameters: `limit`, `offset`, `q` (full text), `filters` (JSON object), `fields`, `sort`.

## Datasets

Enumerate everything live:

```
https://data.smartdublin.ie/api/3/action/package_search?rows=100&start=0
```

Publishers:

| Publisher (`organization` value) | Datasets |
| --- | --- |
| Fingal County Council (`fingal-county-council`) | 418 |
| South Dublin County Council (`south-dublin-county-council`) | 231 |
| Dublin City Council (`dublin-city-council`) | 159 |
| Dún Laoghaire-Rathdown County Council (`dun-laoghaire-rathdown-county-council`) | 109 |
| National Transport Authority (`national-transport-authority`) | 7 |
| Dublinked, PSRA, 3D Data Hack Dublin | 2 each |
| Dept of Education, Dublin City BID, Dublin Region Flooding Data, LGMA, NUI Maynooth AIRO | 1 each |

Live APIs (all six datasets with format `API`):

| Dataset name | What it gives | Notes |
| --- | --- | --- |
| `dublinbikes-api` | Bike station status, current and historical. | Current stations: `https://data.smartdublin.ie/dublinbikes-api/bikes/dublin_bikes/current/stations.geojson`. OpenAPI: `https://data.smartdublin.ie/dublinbikes-api/bikes/openapi.json`. Monthly history CSVs from 2018. |
| `bleeperbike` | Bleeperbike dockless bike locations. | OpenAPI resource listed. |
| `moby-bikes` | Moby e-bike locations. | OpenAPI resource listed. |
| `pedestrian-and-cycle-counter-api-for-dublin-region` | Pedestrian and cycle counts. | CSV and GeoJSON also listed. |
| `sonitus` | Noise and air quality monitoring (Dublin City Council). | API described in a text file. |
| `beaches-api` | Bathing water. | See also the [EPA bathing water API](epa.md). |

Datasets relevant to the hackathon themes:

| Theme | Dataset name | Publisher | Formats |
| --- | --- | --- | --- |
| Transport | `nta-protected-cycle-infrastructure-2025` | NTA | CSV, GeoJSON, KML, SHP |
| Transport | `greater-dublin-area-cycle-infrastructure-nta` | NTA | CSV, KML, WMS |
| Transport | `cycle-counters` | NTA | ZIP |
| Transport | `dublin-city-centre-cycle-counts` | Dublin City Council | CSV, GeoJSON, XLSX |
| Transport | `dublin-public-cycle-parking-facilities` | Dublin City Council | CSV, GeoJSON |
| Transport | `traffic-signal-sites-juctions-dcc` | Dublin City Council | CSV, GeoJSON |
| Amenities | `dublin-city-centre-footfall-counters` | Dublin City Council | CSV, GeoJSON, XLSX |
| Amenities | `public-toilets-fcc4`, `public-toilets-dlr` | Fingal, DLR | CSV, GeoJSON, KML |
| Reuse / repair | `recycling-centers-dcc` | Dublin City Council | CSV, GeoJSON, WMS |
| Reuse / repair | `bring-banks-textile-recycling-dcc` | Dublin City Council | CSV |
| Reuse / repair | `waste-data-glassco` — glass recycling | Dublin City Council | CSV, GeoJSON |
| Housing | `derelict-site-register` | Dublin City Council | GeoJSON |
| Environment | `google-airview-data-dublin-city` (May 2021 – Aug 2022) | Dublin City Council | CSV, GeoJSON, SHP |
| Environment | `decarbonising-zone-fcc` | Fingal County Council | CSV, GeoJSON, KML |
| Economy | `dublin-economic-monitor` | Dublin City Council | CSV, GeoJSON |

Match counts for sample searches: "energy" 247, "parking" 195, "planning" 197, "recycling" 43, "traffic volumes" 43, "housing" 42, "footfall" 34, "bus" 21, "air quality" 11, "bring banks" 10.

## Formats

By count: HTML 649; CSV 648; ZIP 440; ArcGIS GeoServices REST API 436; KML 401; GeoJSON 395; WMS 51; DB_TABLE 38; PDF 30; XLS 23; XLSX 15; SHP 14. Fingal and South Dublin datasets usually link to an ArcGIS feature service that can be queried directly.

## Licence and attribution

Licence counts: `cc-by` 488; `CC-BY-4.0` 417; `cc-zero` 27; `cc-nc` 2; other open 1. Credit the council or agency named as the publisher.

## Rate limits and update cadence

No rate limit is documented. Update cadence is per dataset; check `metadata_modified` and the resource `last_modified`. Many council datasets are annual snapshots.

## Known gotchas

- **Overlap with data.gov.ie.** The national portal harvests this one, so the same dataset appears in both.
- **Not everything is in the DataStore.** `datastore_active` varies even between resources of one dataset.
- **Real-time bus and Luas data is not here.** A search for "luas" returns no live feed. Use [NTA/TFI](nta-tfi.md).
- **Search needs URL encoding.** Encode spaces as `+` or `%20`.
- **Format labels are inconsistent** (`csv` and `CSV`, `geojson` and `GEOJSON`).
- **Historic one-off datasets** (surveys from 2007 and 2013, for example) sit beside current ones. Check dates before use.

## Source links

- [Dublinked portal](https://data.smartdublin.ie/)
- [CKAN 2.9 API guide](https://docs.ckan.org/en/2.9/api/)
- [CKAN DataStore API](https://docs.ckan.org/en/2.9/maintaining/datastore.html)
