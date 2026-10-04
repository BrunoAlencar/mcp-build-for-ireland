# EPA Open Data API Reference

The Environmental Protection Agency publishes seven documented REST APIs, a map server, and a river-level service. Verified against the live APIs on 2026-10-04.

## Overview

| Item | Value |
| --- | --- |
| Portal | `https://data.epa.ie/` |
| API list | `https://data.epa.ie/api-list/` |
| Method | `GET`, JSON responses |
| Terms | `https://data.epa.ie/terms-of-service/` |

## Authentication

None for any service on this page.

## Endpoints

### The seven documented APIs

| API | Base URL | Swagger | Size on 2026-10-04 |
| --- | --- | --- | --- |
| Bathing Water | `https://data.epa.ie/bw/api/v1` | `https://data.epa.ie/bw/swagger/` | 243 locations; 25,978 measurements |
| Water Framework Directive (WFD) | `https://wfdapi.edenireland.ie/api` | `https://wfdapi.edenireland.ie/docs/index` | 46 catchments |
| Radiation Monitoring | `https://data.epa.ie/radmon/api/v1` | `https://data.epa.ie/radmon/swagger/` | 9,453,183 measurements |
| Medium Combustion Plant (MCP) | `https://data.epa.ie/mcp/api/v1` | `https://data.epa.ie/mcp/swagger` | 705 plants |
| Environmental Performance Reporting (EPR) | `https://data.epa.ie/epr/api/v1` | Linked from the API page | 33 county entries |
| Licence and Enforcement (LEAP) | `https://data.epa.ie/leap/api/v1` | `https://data.epa.ie/leap/swagger` | 111 paths |
| Extractive Industries (EI) | `https://data.epa.ie/ei/api/v1` | `https://data.epa.ie/ei/swagger` | 1,871 quarry and mine sites |

**Bathing Water**

```
https://data.epa.ie/bw/api/v1/locations?page=1&per_page=10
https://data.epa.ie/bw/api/v1/locations/IEEABWC140_0000_0300
https://data.epa.ie/bw/api/v1/measurements?page=1&per_page=10
https://data.epa.ie/bw/api/v1/alerts?page=1&per_page=10
```

- `locations`: `beach_id`, `beach_name`, `county_name`, `local_authority_name`, `easting`, `northing`, `annual_water_quality_assessment`.
- `measurements`: `result_date`, `e_coli_result`, `intestinal_enterococci_result`, `sample_water_quality_status`.
- `alerts`: current incidents with `has_bathing_restriction_in_place`, `incident_start_date`, `bathing_restriction_type`.

**Water Framework Directive**

```
https://wfdapi.edenireland.ie/api/catchment
https://wfdapi.edenireland.ie/api/catchment/09
https://wfdapi.edenireland.ie/api/catchment/09/subcatchment/09_1
https://wfdapi.edenireland.ie/api/waterbody/IE_SE_16B020080
https://wfdapi.edenireland.ie/api/search?v=liffey&size=10&page=1
```

Also: `/waterbody/{id}/trend/{trendId}`, `/charts/catchments`, `/monitoringprogramme/{waterbodyId}/summarize/{iteration}`, `/monitoringprogramme/iterations/{waterbodyId}`, `/areaforaction?chariteration={n}&type={type}`, `/catchmentproject?chariteration={n}`.

**Radiation Monitoring**

```
https://data.epa.ie/radmon/api/v1/measurements?page=1&per_page=10
```

Each row has `location_name`, `latitude_dec`, `longitude_dec`, and the reading.

**Medium Combustion Plant**

```
https://data.epa.ie/mcp/api/v1/combustionplants?page=1&per_page=10
https://data.epa.ie/mcp/api/v1/combustionplants/M0003-01
```

**Environmental Performance Reporting** (industrial emissions by facility and year)

```
https://data.epa.ie/epr/api/v1/counties
https://data.epa.ie/epr/api/v1/pollutants?mediumid=1
https://data.epa.ie/epr/api/v1/facilities/search?year=2017&countyid=919780003&facilityname=smi
https://data.epa.ie/epr/api/v1/reportdata/2017/p0004/pollutantreleases
```

`facilities/search` requires `facilityname` with at least three characters; without it the API returns HTTP 400. `countyid` values come from `/counties`.

**LEAP** groups its 111 paths under: `Licence`, `LicenceProfile`, `LicenceAction`, `LicenceTransfer`, `Permit`, `Site`, `SiteVisit`, `Incident`, `Complaint`, `NonCompliance`, `ComplianceList`, `Ci`, `Document`, `Submission`, `LicenseeReturns`, `Notifiers`, `Task`, `EdenMessage`, `MeetingCorrespondence`. Read the Swagger file for parameters: `https://data.epa.ie/leap/swagger/v1/swagger.json`.

**Extractive Industries**

```
https://data.epa.ie/ei/api/v1/extractiveindustries
https://data.epa.ie/ei/api/v1/extractiveindustries/QS0066
https://data.epa.ie/ei/api/v1/localauthority
https://data.epa.ie/ei/api/v1/sitestatus
```

### Map layers (GeoServer)

`https://gis.epa.ie/geoserver/wfs` serves 447 feature types through WFS and WMS. List them:

```
https://gis.epa.ie/geoserver/wfs?service=WFS&version=2.0.0&request=GetCapabilities
```

Fetch one as GeoJSON with a standard WFS call:

```
https://gis.epa.ie/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=EPA:AIR_MonitoringSites&outputFormat=application/json&count=10
```

Layers by workspace: `EPA` 420, `INSPIRE` 12, `DWWTS` 7, `lema` 4, `wfd` 3. Useful layers: `EPA:AIR_MonitoringSites`, `EPA:AIR_Zones`, `EPA:AIR_NO2`, `EPA:AIR_PM10`, `EPA:AIR_PM2_5`, `EPA:AIR_COALRESTRICTEDAREAS`, `EPA:BathingWaterQuality`, `EPA:IllegalWasteRiskMap`.

### River and lake levels (HydroNet)

```
https://epawebapp.epa.ie/Hydronet/output/internet/stations/stations.json
https://epawebapp.epa.ie/Hydronet/output/internet/stations/index.json
```

`stations.json` lists stations with `station_no`, `station_name`, `station_latitude`, `station_longitude`, and `catchment_name`. `index.json` links to per-station folders of time series.

## Datasets

The full set is the seven APIs above, the 447 GeoServer layers, and HydroNet. The EPA also lists 451 datasets on [data.gov.ie](data-gov-ie.md) under `organization:environmental-protection-agency`.

| Theme | Source |
| --- | --- |
| Swimming and beaches | Bathing Water API |
| Rivers, lakes, coastal water status | WFD API |
| River and lake levels | HydroNet |
| Air quality stations and zones | GeoServer `EPA:AIR_*` layers; `inspire-air-quality-data-hvd` on data.gov.ie |
| Industrial emissions and licences | EPR, LEAP, MCP |
| Quarries and mines | Extractive Industries |
| Background radiation | Radiation Monitoring |

## Formats

JSON for the REST APIs. GeoServer returns GML by default and GeoJSON, CSV, or shapefile on request through `outputFormat`.

## Licence and attribution

The Bathing Water and WFD API pages state Creative Commons Attribution 4.0 International. Credit the Environmental Protection Agency. For the other services, read the terms of service page before reuse.

## Rate limits and update cadence

No rate limit is documented. Paged APIs take `page` and `per_page` and return `count` plus a `_links.next` reference. Bathing water is sampled in the bathing season (June to mid-September). WFD status is assessed in multi-year cycles; the API reports "WFD Cycle 3".

## Known gotchas

- **No documented live air quality API.** `airquality.ie` shows hourly readings, but its data endpoint (`assets/php/get-monitors.php`) returns "FORBIDDEN" to direct requests. Use the GeoServer layers for station locations and the data.gov.ie records for data files.
- **Coordinates are mixed.** Bathing water uses Irish Grid `easting`/`northing`. WFD extents are Irish Grid too. HydroNet and radiation give latitude and longitude.
- **Field names differ by API**: `per_page` in most, `size` in WFD search.
- **Trailing spaces** occur in some string fields (`location_code`, `sample_code`). Trim them.
- **The radiation table is huge.** Never page through all of it; filter or take recent pages.
- **The WFD API is on a different host** (`wfdapi.edenireland.ie`).
- **Bathing alerts are few and current only** (two on the verification date).
- **The Extractive Industries list ignores paging.** It returned all 1,871 sites (about 525 KB) even with `per_page=10`.
- **The EPR search example returned an empty list** on the verification date. The call is valid; try other `facilityname` values.
- **The EPA's own Extractive Industries example is stale.** Its page uses registration number `QS00066`, which returns 404; the live record is `QS0066`. Take IDs from a list call.

## Source links

- [EPA API list](https://data.epa.ie/api-list/)
- [Bathing Water API](https://data.epa.ie/api-list/bathing-water-open-data/)
- [WFD API](https://data.epa.ie/api-list/wfd-open-data/)
- [EPA Maps](https://gis.epa.ie/)
- [Air quality site](https://airquality.ie/)
