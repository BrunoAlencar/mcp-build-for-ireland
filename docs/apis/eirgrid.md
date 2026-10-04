# EirGrid Real-Time System Information Reference

EirGrid publishes electricity system data for the island of Ireland through the Smart Grid Dashboard. Verified on 2026-10-04.

**EirGrid does not document a public API.** The endpoint below is the one the dashboard website itself calls. It worked on the date above, but it is unofficial and can change without notice. The supported route is the dashboard's CSV download.

## Overview

| Item | Value |
| --- | --- |
| Dashboard | `https://www.smartgriddashboard.com/` |
| Unofficial data URL | `https://www.smartgriddashboard.com/api/chart/` |
| Regions | `ALL` (all-island), `ROI` (Ireland), `NI` (Northern Ireland) |
| Method | `GET`, JSON response |

## Authentication

None.

## Endpoints

One endpoint, selected by the `areas` parameter:

```
https://www.smartgriddashboard.com/api/chart/?region=ALL&chartType=default&dateRange=day&dateFrom=03-Oct-2026+00:00&dateTo=03-Oct-2026+23:59&areas=demandactual
```

| Parameter | Values |
| --- | --- |
| `region` | `ALL`, `ROI`, `NI` |
| `areas` | One of the area names in the table below |
| `dateFrom`, `dateTo` | `DD-Mon-YYYY+HH:MM`, such as `03-Oct-2026+00:00` |
| `chartType` | `default` |
| `dateRange` | `day` |

Response shape:

```json
{"Rows":[{"EffectiveTime":"03-Oct-2026 00:00:00","FieldName":"SYSTEM_DEMAND","Region":"ALL","Value":4373}]}
```

## Datasets

Every area that returned data:

| `areas` value | `FieldName` in response | Meaning | Interval |
| --- | --- | --- | --- |
| `demandactual` | `SYSTEM_DEMAND` | Actual system demand | 15 minutes |
| `demandforecast` | (empty for a past day) | Forecast demand | 15 minutes |
| `generationactual` | `GEN_EXP` | Actual generation | 15 minutes |
| `windactual` | `WIND_ACTUAL` | Wind generation | 15 minutes |
| `windforecast` | `WIND_FCAST` | Forecast wind generation | 15 minutes |
| `solaractual` | `SOLAR_ACTUAL` | Large-scale solar generation | 15 minutes |
| `solarforecast` | `SOLAR_FCAST` | Forecast solar generation | 15 minutes |
| `co2intensity` | `CO2_INTENSITY` | CO2 per unit of electricity | 15 minutes |
| `co2emission` | `CO2_EMISSIONS` | Total CO2 emissions | 15 minutes |
| `interconnection` | `INTER_EWIC` and others | Flow on each interconnector | 15 minutes |
| `frequency` | `SYS_FREQUENCY` | System frequency | 5 seconds |
| `SnspALL` | `SNSP_ALL` | Share of non-synchronous generation | 30 minutes |
| `fuelmix` | `FUEL_COAL`, `FUEL_GAS`, and others | Fuel mix over the latest 24 hours | Single snapshot |

Sample all-island values on 2026-10-03 at 00:00: demand 4,373; generation 3,494; wind 950; CO2 intensity 216; frequency 49.93. Ireland demand was 3,745 and Northern Ireland 628.

## Formats

JSON from the unofficial endpoint. The dashboard also offers CSV download from each chart.

## Units

**The response carries no units.** The dashboard labels these series as follows; confirm on the dashboard before publishing a figure:

| Series | Unit shown on the dashboard |
| --- | --- |
| Demand, generation, wind, solar, interconnection | MW |
| CO2 intensity | gCO2/kWh |
| CO2 emissions | tCO2 per hour |
| Frequency | Hz |
| SNSP | % |
| Fuel mix | MWh over the 24-hour window |

## Licence and attribution

EirGrid states the information is "for general information purposes only", provided "as is" with no warranty, and that it is not liable for errors. No open licence is stated. Credit EirGrid and link to the dashboard. Ask EirGrid before commercial reuse.

## Rate limits and update cadence

No limit is documented. Because the endpoint is unofficial, keep requests small and infrequent and cache results. Most series update every 15 minutes.

## Known gotchas

- **Unofficial endpoint.** An older path, `/DashboardService.svc/data`, now returns HTTP 503. Expect this one to change too. Keep a dated sample as a demo fallback.
- **`fuelmix` ignores the date range.** It returned the current 24-hour snapshot, stamped with the present time.
- **`frequency` is very large.** One day at 5-second resolution is about 17,000 rows. Request a short window.
- **Timestamps have no timezone marker.** Treat them as Irish local time and say so in output.
- **Solar excludes small-scale embedded generation**, such as rooftop panels.
- **Interconnection is positive or negative** depending on flow direction. The `Region` on those rows is `ROI` even when `ALL` is requested.
- **Forecast series can be empty** for past dates.

## Source links

- [EirGrid real-time system information](https://www.eirgrid.ie/grid/real-time-system-information)
- [Smart Grid Dashboard](https://www.smartgriddashboard.com/)
