# CSO PxStat API Reference

The Central Statistics Office publishes its statistical tables through PxStat. Each table ("matrix") has a short code such as `HPM09`. Verified against the live API on 2026-10-04.

## Overview

| Item | Value |
| --- | --- |
| RESTful base URL | `https://ws.cso.ie/public/api.restful` |
| JSON-RPC URL | `https://ws.cso.ie/public/api.jsonrpc` |
| Browse in a browser | `https://data.cso.ie/` |
| Tables | 13,079 live tables in 104 subjects |
| Latest table update seen | 2026-10-02 |

## Authentication

None. All read methods are anonymous.

## Endpoints

RESTful methods are appended to the base URL.

| Method | Purpose | Example |
| --- | --- | --- |
| `PxStat.Data.Cube_API.ReadCollection` | Every live table with title, dimensions, and update time. | `/PxStat.Data.Cube_API.ReadCollection` |
| `PxStat.Data.Cube_API.ReadDataset/{matrix}/{format}/{version}/{lang}` | A whole table. | `/PxStat.Data.Cube_API.ReadDataset/HPM09/JSON-stat/2.0/en` |
| `PxStat.Data.Cube_API.ReadMetadata/{matrix}/{format}/{version}/{lang}` | Dimensions and units without values. | `/PxStat.Data.Cube_API.ReadMetadata/HPM09/JSON-stat/2.0/en` |
| `PxStat.Data.Cube_API.PxAPIv1/{lang}` | Subject tree for browsing. | `/PxStat.Data.Cube_API.PxAPIv1/en` then `/en/76` |

Format and version pairs: `JSON-stat/2.0`, `JSON-stat/1.0`, `CSV/1.0`, `PX/2013`, `XLSX/2007`. Languages: `en`, and `ga` where a table has Irish metadata.

**Filtered queries** use JSON-RPC `POST` to `https://ws.cso.ie/public/api.jsonrpc`. This request returns only January 2025 from `HPM09`:

```json
{
  "jsonrpc": "2.0",
  "method": "PxStat.Data.Cube_API.ReadDataset",
  "params": {
    "class": "query",
    "id": ["TLIST(M1)"],
    "dimension": { "TLIST(M1)": { "category": { "index": ["202501"] } } },
    "extension": {
      "pivot": null,
      "codes": false,
      "language": { "code": "en" },
      "format": { "type": "JSON-stat", "version": "2.0" },
      "matrix": "HPM09"
    },
    "version": "2.0"
  },
  "id": 1
}
```

List the dimensions you want to restrict in `id`, and give the wanted category codes for each in `dimension`. Dimensions left out are returned in full.

The wiki also documents `ReadCollection/{datefrom}/{language}` for tables changed since a date. That form was not verified here.

## Datasets

Enumerate everything live with `ReadCollection`. The response is about 13,000 entries, so cache it.

Each entry has `label` (title), `extension.matrix` (the code), `updated`, `dimension` (labels), and `link.alternate` (download URLs).

All 104 subjects from `PxAPIv1/en`:

Agri-Environment; Agriculture; Births, Deaths & Marriages; Business Expenditure on Research and Development; Business Sectors; Business Sectors HVD; Census 1911; Census 1926; Census 1996; Census 2002; Census 2006; Census 2011; Census 2011 Special Report; Census 2016; Census 2022; Census of Agriculture; Census of Industrial Production; Census Requested Tabulations; Census Time Series; Central Bank; Centre for Economics, Policy & History (TCD); Climate; Construction; Crime & Justice; Department of Agriculture, Food and the Marine; Department of Children, Disability and Equality; Department of Education and Youth; Department of Enterprise, Trade and Employment; Department of Health; Department of Housing, Local Government and Heritage; Department of Social Protection; Department of Transport; Distance to Remote Work Hubs and Childcare Services; Earnings; Economy HVD; Ecosystem Accounts; Education; Energy; Environment Accounts; Environment HVD; Environment Statistics; Environmental Indicators; Environmental Protection Agency; External Trade; Farm Structure Survey; Finance; Fishery; Foreign National Activity; Forestry; Government Accounts; Health; Health and Safety Authority; Health Research Board; Health Service Executive (HIPE); Higher Education Authority; Household Environmental Behaviours; Housing & Households; IMDO Shipping Statistics; Indicators; Industry; Information Society; Innovation in Irish Enterprises; International Accounts; Labour Market; Labour Market and Earnings HVD; LFS Special Modules; Life in Ireland; Life in Ireland in 1926 and 2022; Mortality Figures using Public Data Sources; National Accounts; National Data Profile; National Perinatal Epidemiology Centre; National Transport Authority; People and Society HVD; Population Estimates; Population Estimates using Administrative Data; Population Projections; Prices; Pulse Survey; QNHS Special Modules; Quality and Qualifications Ireland; Residential Tenancies Board; Revenue Commissioners Tax & Customs Statistics; Road Safety Authority of Ireland; SAPMAP 2011; SAPMAP 2016; SAPMAP 2022; Services; Social Conditions; Social Modules; Solas; Student Universal Support Ireland (SUSI); Sub-National Statistics; Survey on Income and Living Conditions (SILC); Sustainable Energy Authority of Ireland; TEST Subject; Tourism & Travel; Transport; Transport Infrastructure Ireland; Ukraine Hub; UN Sustainable Development Goals; Waste; Water and Waste Water; Women and Men in Ireland.

Subject IDs for common themes: Census 2022 `76`, SAPMAP 2022 (small-area population) `88`, Housing & Households `23`, Residential Tenancies Board `43`, Transport `6`, National Transport Authority `112`, Transport Infrastructure Ireland `49`, Energy `81`, SEAI `45`, Waste `92`, Environmental Protection Agency `64`.

Tables for common themes:

| Theme | Matrix | Title | Last updated |
| --- | --- | --- | --- |
| Housing | `HPM09` | Residential Property Price Index (monthly) | 2026-09-16 |
| Housing | `HPQ01` | Residential Property Price Index (quarterly) | 2026-08-19 |
| Housing | `NDQ01` | New Dwelling Completions | 2026-07-30 |
| Housing | `NDQ09` | New Dwelling Completions by Local Electoral Area | 2026-07-30 |
| Retrofit | `EBQ02` | Domestic Building Energy Ratings | 2026-08-27 |
| Retrofit | `NDBER01` | Non-Domestic Building Energy Ratings | 2026-08-26 |
| Energy | `MEC03` | Metered Electricity Consumption | 2026-07-07 |
| Energy | `MEC02` | Data Centres Metered Electricity Consumption | 2026-07-07 |
| Transport | `TII03` | Passenger Journeys by Luas | 2026-09-22 |
| Transport | `TOA11` | Luas Passenger Numbers | 2026-05-21 |
| Transport | `TOA13` | Dublin Bus Fleet by Garage | 2026-05-12 |
| Transport | `TEM01` | Vehicles Licensed for the First Time | 2026-09-10 |
| Population | `URLIA01` | Population Usually Resident and Present in the State | 2026-04-21 |
| Prices | `CPM02` | Consumer Price Index | 2026-09-10 |
| Reuse / waste | `EIIEEA30` | Municipal waste generated per capita | 2026-07-23 |
| Reuse / waste | `EIIEEA32` | Recovery of packaging waste | 2026-07-24 |

## Formats

JSON-stat 2.0 (default for code), JSON-stat 1.0, CSV, PX, XLSX. The CSV is long-form: one row per value with code and label columns for each dimension, plus `UNIT` and `VALUE`.

In JSON-stat, `value` is a flat array. Its order follows the dimension order in `id` and sizes in `size`. Units are under `dimension.STATISTIC.category.unit`.

## Licence and attribution

Each response names "Central Statistics Office, Ireland" as copyright holder. CSO tables are listed on data.gov.ie as CC BY 4.0. Credit the CSO and cite the table code.

## Rate limits and update cadence

No rate limit is documented. Tables update on the CSO release calendar; each has its own `updated` timestamp. Releases are stamped 11:00 UTC.

## Known gotchas

- **`ReadCollection` links point at the wrong host.** Its `href` values use `dev-ws2.cso.ie`. Build the URL from the matrix code and `ws.cso.ie` instead.
- **Whole-table reads can be large.** Census and small-area tables run to many megabytes. Call `ReadMetadata` first, then filter with JSON-RPC.
- **Title search is weak.** Many tables share a title (seven are named "Residential Property Price Index"). Tell them apart by dimensions.
- **A "TEST Subject" appears in the subject tree.** Ignore it.
- **Time codes vary by frequency**: `TLIST(A1)` annual (`2022`), `TLIST(Q1)` quarterly, `TLIST(M1)` monthly (`202501`).
- **Missing values** are `null` in JSON-stat; check before doing arithmetic.

## Source links

- [PxStat API wiki](https://github.com/CSOIreland/PxStat/wiki/API)
- [RESTful cube methods](https://github.com/CSOIreland/PxStat/wiki/API-Cube-RESTful)
- [CSO data portal](https://data.cso.ie/)
- [JSON-stat format](https://json-stat.org/)
