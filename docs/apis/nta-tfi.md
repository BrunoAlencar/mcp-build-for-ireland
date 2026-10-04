# NTA / TFI API Reference

The National Transport Authority (NTA) publishes Transport for Ireland (TFI) timetables as GTFS files and live updates as a GTFS-Realtime API. Verified on 2026-10-04. The live API needs a key, so its responses were not inspected; those parts are marked **unverified**.

## Overview

| Item | Value |
| --- | --- |
| Static timetables | `https://www.transportforireland.ie/transitData/Data/` (ZIP files, no key) |
| Realtime base URL | `https://api.nationaltransport.ie/gtfsr/v2` (key required) |
| Developer portal | `https://developer.nationaltransport.ie/` |
| Realtime version | GTFS-Realtime v2 (replaced v1 in early 2023) |

## Authentication

- **Static GTFS:** none.
- **Realtime:** register on the developer portal and subscribe to the "GTFS-Realtime" product. A subscription takes about 15 minutes to become active. You get a primary and a secondary key; either works.
- A request without a key returns HTTP 401: "Access denied due to missing subscription key."
- **Unverified:** the header name. Community clients send the key as `x-api-key`. The portal runs on Azure API Management, whose default header is `Ocp-Apim-Subscription-Key`. Check the portal's API page after signing in.

Keep the key in a local environment variable. Never commit it or return it in tool output.

## Endpoints

Realtime paths under `https://api.nationaltransport.ie/gtfsr/v2`. Each returned 401 without a key, which confirms the path exists:

| Path | Content |
| --- | --- |
| `/TripUpdates` | Predicted arrival and departure times, delays, cancellations. |
| `/Vehicles` | Vehicle positions. |
| `/gtfsr` | Combined feed. |

`/Alerts` and `/ServiceAlerts` returned 404; there is no separate alerts path.

**Unverified:** responses are GTFS-Realtime protocol buffers by default, and `?format=json` returns JSON.

Static files are plain downloads:

```
https://www.transportforireland.ie/transitData/Data/GTFS_Realtime.zip
```

## Datasets

All static GTFS files, under `https://www.transportforireland.ie/transitData/Data/`:

| File | Operator |
| --- | --- |
| `GTFS_All.zip` | Every operator (about 180 MB) |
| `GTFS_Realtime.zip` | Operators covered by the realtime API (about 144 MB) |
| `GTFS_Dublin_Bus.zip` | Dublin Bus (about 30 MB) |
| `GTFS_Bus_Eireann.zip` | Bus Éireann |
| `GTFS_GoAhead.zip` | Go-Ahead Ireland |
| `GTFS_Irish_Rail.zip` | Irish Rail (about 8 MB) |
| `GTFS_LUAS.zip` | Luas (about 1 MB) |
| `GTFS_Local_Link.zip` | TFI Local Link |
| `GTFS_Aircoach.zip` | Aircoach |
| `GTFS_Bernard_Kavanagh.zip` | Bernard Kavanagh |
| `GTFS_City_Direct.zip` | City Direct |
| `GTFS_Citylink.zip` | Citylink |
| `GTFS_Dublin_Coach.zip` | Dublin Coach |
| `GTFS_Express_Bus.zip` | Express Bus |
| `GTFS_JJ_Kavanagh.zip` | JJ Kavanagh |
| `GTFS_Kearns_Transport.zip` | Kearns Transport |
| `GTFS_Matthews.zip` | Matthews |
| `GTFS_McGrath.zip` | McGrath Coaches |
| `GTFS_Nitelink.zip` | Nitelink |
| `GTFS_Slieve_Bloom.zip` | Slieve Bloom Coach Tours |
| `GTFS_Small_Operators.zip` | Small operators |
| `GTFS_Swords_Express.zip` | Swords Express |
| `GTFS_Wexford_Bus.zip` | Wexford Bus |
| `GTFS_Ferry_Cable_Flight.zip` | Ferries, cable cars, regional flights |

Realtime coverage, as stated by the portal: Dublin Bus, Bus Éireann, and Go-Ahead Ireland.

Related NTA datasets on other portals:

| Dataset | Where |
| --- | --- |
| `national-public-transport-access-nodes-naptan` — every stop with coordinates | [data.gov.ie](data-gov-ie.md) |
| `nta-gtfs` — catalogue record for these feeds | [data.gov.ie](data-gov-ie.md) |
| `cycle-counters`, cycle infrastructure datasets | [Dublinked](dublinked.md) |
| Luas and bus passenger tables (`TII03`, `TOA11`) | [CSO](cso-pxstat.md) |

## Formats

- **Static:** GTFS, a ZIP of CSV text files (`stops.txt`, `routes.txt`, `trips.txt`, `stop_times.txt`, `calendar.txt`, `calendar_dates.txt`, `shapes.txt`, `agency.txt`).
- **Realtime:** GTFS-Realtime v2. Join it to the static feed on `trip_id`, `route_id`, and `stop_id`. Use `GTFS_Realtime.zip` as the matching static feed.

## Licence and attribution

CC BY 4.0, attributed to the National Transport Authority. The fair usage policy requires three things in any product: the NTA named as data provider, a link to the data source, and a statement that the data is provided "as is".

## Rate limits and update cadence

- **Realtime:** each key may call the API once every 60 seconds. Limits are daily and do not carry over.
- **Static:** files are regenerated often; all had a last-modified time of 2026-10-03 22:15 GMT. Re-download regularly, as IDs change between versions.
- Prohibited: scraping or automated bulk downloading that degrades the service, commercial exploitation without significant public benefit, and misrepresenting the data.

## Known gotchas

- **Poll once a minute at most**, and cache the response for all users. One key per app, not per user.
- **Static and realtime must match.** A stale static feed gives `trip_id` values that do not join.
- **The big files are slow.** `GTFS_Realtime.zip` did not finish downloading in 40 seconds here. Use a single-operator file for a demo.
- **Luas and Irish Rail live data is not in the portal's stated coverage.** Do not promise live tram or train times from this API without checking.
- **A cancelled or added trip** shows up only in `TripUpdates`, not in the static feed.
- Support contact: `apisupport@nationaltransport.ie`.

## Source links

- [NTA developer portal](https://developer.nationaltransport.ie/)
- [Fair usage policy](https://developer.nationaltransport.ie/usagepolicy)
- [TFI static GTFS downloads](https://www.transportforireland.ie/transitData/PT_Data.html)
- [GTFS-Realtime v2 reference](https://gtfs.org/reference/realtime/v2/)
- [NTA notice on the v2 upgrade](https://www.nationaltransport.ie/attention-developers-upgrade-to-gtfs-realtime-api/)
