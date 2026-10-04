# Met Éireann Open Data Reference

Met Éireann, the Irish meteorological service, publishes forecasts, warnings, observations, radar, and climate records. There is no single API; each product has its own URL. Verified on 2026-10-04.

## Overview

| Item | Value |
| --- | --- |
| Open data page | `https://www.met.ie/about-us/specialised-services/open-data` |
| Point forecast API | `http://openaccess.pf.api.met.ie/metno-wdb2ts/locationforecast` |
| Text forecasts and warnings | `https://www.met.ie/Open_Data/json/` |
| Bulk files | `https://opendata2.met.ie/` |
| Catalogue | 2,051 datasets on data.gov.ie (`organization:meteireann`) |

## Authentication

None for anything on this page.

## Endpoints

### Point forecast API

```
http://openaccess.pf.api.met.ie/metno-wdb2ts/locationforecast?lat=53.35;long=-6.26
```

- Returns XML for one point: temperature (°C), wind direction and speed (m/s, Beaufort), gust, humidity (%), pressure, cloud, global radiation (W/m²), precipitation, and a weather symbol.
- The `<meta>` block names two models. On the verification date: `harmonie` covered the next two days and `ecmwf` the period after, out to ten days.
- Each `<model>` has `termin` (model run time), `runended`, `nextrun`, `from`, and `to`. Each `<time>` element has its own `from` and `to` valid times.
- Documentation: `https://opendata2.met.ie/docs/Notes-on-API-XML-file_V8.odt`.

### Text forecasts (JSON)

All under `https://www.met.ie/Open_Data/json/`:

| File | Content |
| --- | --- |
| `National.json` | National forecast: `issued`, `today`, `tonight`, `tomorrow`, and outlook text |
| `Outlook.json` | National outlook |
| `Dublin.json`, `Leinster.json`, `Munster.json`, `Connacht.json`, `Ulster.json` | Regional forecasts |
| `coastal.json` | Coastal reports |
| `Met-Sea-area.json` | Sea area forecast |
| `Inland_Lake_Forecast.json` | Inland lakes forecast |

XML versions are listed on the data.gov.ie record `met-eireann-live-text-forecast-data`, including `county_forecast.xml`, `web-3Dayforecast.xml`, `fcom.xml` (farming), and `xsea_crossings.xml`.

### Weather warnings

```
https://www.met.ie/Open_Data/json/warning_IRELAND.json
https://www.met.ie/warningsxml/rss.xml
```

- `warning_IRELAND.json` holds current national warnings. It returns `[]` when none are in force.
- `warning_ALL.json` holds all warnings. Per-area files follow `warning_EI{code}.json`: codes `EI01` to `EI31` and `EI805` to `EI825`.
- The RSS feed links to CAP (Common Alerting Protocol) files. A feed description is at `https://www.met.ie/Open_Data/Warnings/Met_Eireann_Warning_description_June2020.pdf`.

### Observations

```
https://www.met.ie/latest-reports/observations/download
```

Returns a CSV of the latest hourly report from each synoptic station: `Station`, `Temperature (ºC)`, `Weather`, `Wind Speed (Kts)`, `Wind Gust (Kts)`, `Wind Direction`, `Humidity (%)`, `Rainfall (mm)`, `Pressure (hPa)`.

Other observation sources:

- `https://opendata2.met.ie/obs_public` — near-real-time automatic weather station files.
- `https://prodapi.metweb.ie/observations/{station}/today` — hourly JSON for one station today, for example `/observations/dublin/today` or `/observations/athenry/today`. **Undocumented**; it is the met.ie website's own backend and may change.
- `https://prodapi.metweb.ie/monthly-data/{station}` — monthly rainfall and temperature totals by year. **Undocumented.**

### Radar and climate

- `https://opendata2.met.ie/radar/` — radar files in HDF5.
- Historical station data: one data.gov.ie dataset per station and frequency, such as `casement-hourly-data` or `belmullet-hourly-data` (CSV).
- `met-eireann-1981-2010-climate-averages` — long-term averages (CSV).
- `m-ra-met-ireann-reanalysis-climate-reanalysis` — MÉRA reanalysis (GRIB).

## Datasets

All live products are listed above. The 2,051 catalogue records are mostly per-station historical series. Enumerate them live:

```
https://data.gov.ie/api/3/action/package_search?fq=organization:meteireann&rows=100&start=0
```

| data.gov.ie dataset name | Content | Licence |
| --- | --- | --- |
| `met-eireann-forecast-api` | Point forecast API | Custom |
| `met-eireann-live-text-forecast-data` | Text forecasts, JSON and XML | Custom |
| `weather-warnings` | Warnings JSON, RSS, CAP examples | Custom |
| `archived-weather-warnings` | Past warnings (ODS) | CC BY 4.0 |
| `latest-observations` | Latest observations CSV | CC BY 4.0 |
| `latest__observations` | Near-real-time AWS observations | CC BY 4.0 |
| `radar`, `irish-weather-radar-data` | Radar files | CC BY 4.0 |
| `meteorological-synoptic-messages` | Synoptic messages (CSV in ZIP) | CC BY 4.0 |
| `{station}-hourly-data` (127 matches) | Hourly historical data per station | CC BY 4.0 |

## Formats

XML (point forecast, RSS, CAP), JSON (text forecasts, warnings), CSV (observations, historical series), HDF5 (radar), GRIB (reanalysis).

## Licence and attribution

Two licences apply:

- **CC BY 4.0** for most datasets, including observations, radar, and historical data.
- **Met Éireann Custom Open Data Licence** for "live" forecast data and warnings: `https://www.met.ie/cms/assets/uploads/2018/05/Met-%C3%89ireann-Open-Data-Custom-Licence_Final.odt`. Read it before redistributing forecasts or warnings.

Met Éireann asks for five things in any attribution:

1. "Copyright Met Éireann".
2. The source, met.ie.
3. The licence statement: "This data is published under a Creative Commons Attribution 4.0 International (CC BY 4.0)".
4. A disclaimer of Met Éireann's liability.
5. A note where the data has been modified.

## Rate limits and update cadence

No rate limit is documented. Cache responses; the forecast only changes when a model run finishes.

- Point forecast: the `<meta>` block gives the next run time. Short-range runs were hours apart on the verification date.
- Text forecasts: reissued several times a day; each file has an `issued` time.
- Observations: hourly.

## Known gotchas

- **The forecast API is HTTP only.** The `https://` form of the same URL returned 404.
- **The forecast parameters are separated by a semicolon**, `lat=53.35;long=-6.26`, not an ampersand.
- **Mixed units.** The forecast gives wind in m/s; the observations CSV gives knots.
- **Keep three times apart**: model run time (`termin`), forecast valid time (`from`/`to`), and observation time. Show which one a value refers to.
- **All times are UTC** in the forecast API and text forecast files.
- **An empty warnings array means no warnings**, not an error.
- **Text forecast JSON is awkwardly nested**: `regions` is an array of single-key objects, not one object.
- **Station names in the undocumented API are free text** (`dublin`, `Dublin%20Airport`, `athenry`).

## Source links

- [Met Éireann open data](https://www.met.ie/about-us/specialised-services/open-data)
- [Met Éireann on data.gov.ie](https://data.gov.ie/organization/meteireann)
- [Forecast API record](https://data.gov.ie/dataset/met-eireann-forecast-api)
- [Weather warnings record](https://data.gov.ie/dataset/weather-warnings)
