import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { asToolError, fetchJson, fetchUpstream, jsonResult, runStdio, UpstreamHttpError } from "./server-helpers.js";

const REALTIME_ROOT = "https://api.nationaltransport.ie/gtfsr/v2";
const STATIC_ROOT = "https://www.transportforireland.ie/transitData/Data";
const SOURCE = "NTA API";
// The NTA fair usage policy allows one call per key every 60 seconds.
const REALTIME_TTL_MS = 60_000;
const ATTRIBUTION = "Data provider: National Transport Authority (NTA), CC BY 4.0, https://developer.nationaltransport.ie. GTFS data is provided \"as is\".";

const FEEDS: Array<{ file: string; operator: string }> = [
  { file: "GTFS_All.zip", operator: "All operators" },
  { file: "GTFS_Realtime.zip", operator: "Operators covered by the realtime API" },
  { file: "GTFS_Dublin_Bus.zip", operator: "Dublin Bus" },
  { file: "GTFS_Bus_Eireann.zip", operator: "Bus Éireann" },
  { file: "GTFS_GoAhead.zip", operator: "Go-Ahead Ireland" },
  { file: "GTFS_Irish_Rail.zip", operator: "Irish Rail" },
  { file: "GTFS_LUAS.zip", operator: "Luas" },
  { file: "GTFS_Local_Link.zip", operator: "TFI Local Link" },
  { file: "GTFS_Aircoach.zip", operator: "Aircoach" },
  { file: "GTFS_Bernard_Kavanagh.zip", operator: "Bernard Kavanagh" },
  { file: "GTFS_City_Direct.zip", operator: "City Direct" },
  { file: "GTFS_Citylink.zip", operator: "Citylink" },
  { file: "GTFS_Dublin_Coach.zip", operator: "Dublin Coach" },
  { file: "GTFS_Express_Bus.zip", operator: "Express Bus" },
  { file: "GTFS_JJ_Kavanagh.zip", operator: "JJ Kavanagh" },
  { file: "GTFS_Kearns_Transport.zip", operator: "Kearns Transport" },
  { file: "GTFS_Matthews.zip", operator: "Matthews" },
  { file: "GTFS_McGrath.zip", operator: "McGrath Coaches" },
  { file: "GTFS_Nitelink.zip", operator: "Nitelink" },
  { file: "GTFS_Slieve_Bloom.zip", operator: "Slieve Bloom Coach Tours" },
  { file: "GTFS_Small_Operators.zip", operator: "Small operators" },
  { file: "GTFS_Swords_Express.zip", operator: "Swords Express" },
  { file: "GTFS_Wexford_Bus.zip", operator: "Wexford Bus" },
  { file: "GTFS_Ferry_Cable_Flight.zip", operator: "Ferries, cable cars, regional flights" },
];

type Json = Record<string, unknown>;

// GTFS-Realtime JSON appears in both snake_case and camelCase, depending on the encoder.
function pick(source: unknown, ...names: string[]): unknown {
  if (!source || typeof source !== "object") return undefined;
  for (const name of names) {
    const value = (source as Json)[name];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

export function mapTripUpdate(entity: unknown, maxStops: number) {
  const update = pick(entity, "trip_update", "tripUpdate");
  if (!update) return undefined;
  const trip = pick(update, "trip");
  const stops = pick(update, "stop_time_update", "stopTimeUpdate");
  return {
    tripId: pick(trip, "trip_id", "tripId"),
    routeId: pick(trip, "route_id", "routeId"),
    startDate: pick(trip, "start_date", "startDate"),
    startTime: pick(trip, "start_time", "startTime"),
    scheduleRelationship: pick(trip, "schedule_relationship", "scheduleRelationship"),
    vehicleId: pick(pick(update, "vehicle"), "id"),
    timestamp: pick(update, "timestamp"),
    stops: (Array.isArray(stops) ? stops : []).slice(0, maxStops).map((stop) => ({
      stopId: pick(stop, "stop_id", "stopId"),
      sequence: pick(stop, "stop_sequence", "stopSequence"),
      arrivalDelaySeconds: pick(pick(stop, "arrival"), "delay"),
      departureDelaySeconds: pick(pick(stop, "departure"), "delay"),
      scheduleRelationship: pick(stop, "schedule_relationship", "scheduleRelationship"),
    })),
  };
}

export function mapVehicle(entity: unknown) {
  const vehicle = pick(entity, "vehicle");
  if (!vehicle) return undefined;
  const trip = pick(vehicle, "trip");
  const position = pick(vehicle, "position");
  return {
    vehicleId: pick(pick(vehicle, "vehicle"), "id"),
    tripId: pick(trip, "trip_id", "tripId"),
    routeId: pick(trip, "route_id", "routeId"),
    latitude: pick(position, "latitude"),
    longitude: pick(position, "longitude"),
    timestamp: pick(vehicle, "timestamp"),
  };
}

const cache = new Map<string, { loadedAt: number; feed: Json }>();

export async function readRealtime(path: "TripUpdates" | "Vehicles", apiKey = process.env.NTA_API_KEY) {
  if (!apiKey) {
    throw new Error("The NTA realtime API needs a subscription key. Register at https://developer.nationaltransport.ie, subscribe to GTFS-Realtime, and set NTA_API_KEY in this server's environment. list_gtfs_feeds works without a key.");
  }
  const cached = cache.get(path);
  if (cached && Date.now() - cached.loadedAt < REALTIME_TTL_MS) {
    return { feed: cached.feed, cached: true };
  }
  try {
    const feed = await fetchJson<Json>(`${REALTIME_ROOT}/${path}?format=json`, { source: SOURCE, timeoutMs: 30_000, headers: { "x-api-key": apiKey } });
    cache.set(path, { loadedAt: Date.now(), feed });
    return { feed, cached: false };
  } catch (error) {
    if (error instanceof UpstreamHttpError && (error.status === 401 || error.status === 403)) {
      throw new Error("The NTA API rejected the subscription key. Check NTA_API_KEY; a new subscription takes about 15 minutes to become active.", { cause: error });
    }
    if (error instanceof UpstreamHttpError && error.status === 429) {
      throw new Error("The NTA API rate limit was reached. Each key may call once every 60 seconds; try again shortly.", { cause: error });
    }
    throw error;
  }
}

function entities(feed: Json) {
  const list = pick(feed, "entity", "Entity");
  return Array.isArray(list) ? list : [];
}

function feedTimestamp(feed: Json) {
  return pick(pick(feed, "header", "Header"), "timestamp", "Timestamp");
}

export function createServer() {
  const server = new McpServer({ name: "build-for-ireland-transport-tfi", version: "0.8.0" });

  server.registerTool(
    "list_gtfs_feeds",
    {
      description: "List the static GTFS timetable files published by Transport for Ireland, with download link, size, and last-modified time. Needs no key. The files are ZIP archives of timetable text files; this tool does not open them.",
      inputSchema: z.object({
        operator: z.string().trim().max(60).optional().describe("Part of an operator name to filter by, such as Dublin Bus or Luas. Leave out for all feeds."),
      }),
    },
    async ({ operator }) => {
      try {
        const matches = FEEDS.filter((feed) => !operator || feed.operator.toLowerCase().includes(operator.toLowerCase()));
        const feeds = await Promise.all(matches.map(async (feed) => {
          const url = `${STATIC_ROOT}/${feed.file}`;
          try {
            const response = await fetchUpstream(url, { source: "TFI download site", method: "HEAD" });
            const bytes = Number(response.headers.get("content-length"));
            return { ...feed, url, sizeMb: bytes ? Math.round(bytes / 1_048_576 * 10) / 10 : undefined, lastModified: response.headers.get("last-modified") ?? undefined };
          } catch {
            return { ...feed, url, unavailable: true };
          }
        }));
        return jsonResult({ source: "https://www.transportforireland.ie/transitData/PT_Data.html", returned: feeds.length, feeds, note: ATTRIBUTION });
      } catch (error) {
        return asToolError(error, "Unexpected TFI error.");
      }
    },
  );

  server.registerTool(
    "get_trip_updates",
    {
      description: "Get live trip updates (delays, cancellations, added trips) from the NTA GTFS-Realtime API, which covers Dublin Bus, Bus Éireann, and Go-Ahead Ireland. Needs NTA_API_KEY. IDs match the GTFS_Realtime.zip static feed. Results are cached for 60 seconds to respect the NTA rate limit.",
      inputSchema: z.object({
        routeId: z.string().trim().max(60).optional().describe("GTFS route_id to filter by."),
        stopId: z.string().trim().max(60).optional().describe("GTFS stop_id to filter by; keeps trips that call at this stop."),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of trips to return (1–50)."),
      }),
    },
    async ({ routeId, stopId, limit }) => {
      try {
        const { feed, cached } = await readRealtime("TripUpdates");
        const trips = entities(feed).map((entity) => mapTripUpdate(entity, 60)).filter((trip) => trip !== undefined)
          .filter((trip) => !routeId || trip.routeId === routeId)
          .filter((trip) => !stopId || trip.stops.some((stop) => stop.stopId === stopId));
        return jsonResult({
          source: "https://developer.nationaltransport.ie",
          feedTimestamp: feedTimestamp(feed),
          servedFromCache: cached,
          totalMatches: trips.length,
          returned: Math.min(trips.length, limit),
          trips: trips.slice(0, limit).map((trip) => ({ ...trip, stops: stopId ? trip.stops.filter((stop) => stop.stopId === stopId) : trip.stops.slice(0, 8) })),
          note: `Delays are in seconds; negative means early. ${ATTRIBUTION}`,
        });
      } catch (error) {
        return asToolError(error, "Unexpected TFI error.");
      }
    },
  );

  server.registerTool(
    "get_vehicle_positions",
    {
      description: "Get live vehicle positions from the NTA GTFS-Realtime API, which covers Dublin Bus, Bus Éireann, and Go-Ahead Ireland. Needs NTA_API_KEY. Results are cached for 60 seconds to respect the NTA rate limit.",
      inputSchema: z.object({
        routeId: z.string().trim().max(60).optional().describe("GTFS route_id to filter by."),
        limit: z.number().int().min(1).max(100).default(25).describe("Maximum number of vehicles to return (1–100)."),
      }),
    },
    async ({ routeId, limit }) => {
      try {
        const { feed, cached } = await readRealtime("Vehicles");
        const vehicles = entities(feed).map(mapVehicle).filter((vehicle) => vehicle !== undefined)
          .filter((vehicle) => !routeId || vehicle.routeId === routeId);
        return jsonResult({
          source: "https://developer.nationaltransport.ie",
          feedTimestamp: feedTimestamp(feed),
          servedFromCache: cached,
          totalMatches: vehicles.length,
          returned: Math.min(vehicles.length, limit),
          vehicles: vehicles.slice(0, limit),
          note: ATTRIBUTION,
        });
      } catch (error) {
        return asToolError(error, "Unexpected TFI error.");
      }
    },
  );

  return server;
}

runStdio(import.meta.url, "transport-tfi", createServer);
