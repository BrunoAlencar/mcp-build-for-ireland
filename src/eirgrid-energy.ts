import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { asToolError, fetchJson, jsonResult, runStdio } from "./server-helpers.js";

const CHART_URL = "https://www.smartgriddashboard.com/api/chart/";
const SOURCE = "EirGrid dashboard";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NOTE = "Unofficial source: this is the endpoint behind EirGrid's Smart Grid Dashboard, not a documented API, and it can change without notice. The response carries no units; the unit shown is the dashboard's label. Times are Irish local time. EirGrid provides this for general information only, with no warranty. Credit EirGrid.";

// Series name -> dashboard "areas" value, unit as labelled on the dashboard, and interval.
const SERIES = {
  demand: { area: "demandactual", unit: "MW", interval: "15 minutes" },
  demand_forecast: { area: "demandforecast", unit: "MW", interval: "15 minutes" },
  generation: { area: "generationactual", unit: "MW", interval: "15 minutes" },
  wind: { area: "windactual", unit: "MW", interval: "15 minutes" },
  wind_forecast: { area: "windforecast", unit: "MW", interval: "15 minutes" },
  solar: { area: "solaractual", unit: "MW", interval: "15 minutes" },
  solar_forecast: { area: "solarforecast", unit: "MW", interval: "15 minutes" },
  co2_intensity: { area: "co2intensity", unit: "gCO2/kWh", interval: "15 minutes" },
  co2_emissions: { area: "co2emission", unit: "tCO2 per hour", interval: "15 minutes" },
  interconnection: { area: "interconnection", unit: "MW", interval: "15 minutes" },
  frequency: { area: "frequency", unit: "Hz", interval: "5 seconds" },
  snsp: { area: "SnspALL", unit: "%", interval: "30 minutes" },
  fuel_mix: { area: "fuelmix", unit: "MWh over the latest 24 hours", interval: "single snapshot" },
} as const;

type SeriesName = keyof typeof SERIES;
const SERIES_NAMES = Object.keys(SERIES) as [SeriesName, ...SeriesName[]];

export type ChartRow = { EffectiveTime?: string; FieldName?: string; Region?: string; Value?: number | null };

// "2026-10-03" -> "03-Oct-2026", the format the dashboard expects.
export function toDashboardDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${MONTHS[Number(month) - 1]}-${year}`;
}

export function todayInIreland(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin" }).format(now);
}

export function summariseRows(rows: ChartRow[]) {
  const fields = new Map<string, { count: number; sum: number; min: number; max: number; latestTime?: string; latestValue?: number }>();
  for (const row of rows) {
    if (!row.FieldName || typeof row.Value !== "number") continue;
    const field = fields.get(row.FieldName) ?? { count: 0, sum: 0, min: Infinity, max: -Infinity };
    field.count += 1;
    field.sum += row.Value;
    field.min = Math.min(field.min, row.Value);
    field.max = Math.max(field.max, row.Value);
    field.latestTime = row.EffectiveTime;
    field.latestValue = row.Value;
    fields.set(row.FieldName, field);
  }
  return [...fields.entries()].map(([field, stats]) => ({
    field,
    readings: stats.count,
    min: stats.min,
    max: stats.max,
    mean: Math.round((stats.sum / stats.count) * 100) / 100,
    latestTime: stats.latestTime,
    latestValue: stats.latestValue,
  }));
}

export function createServer() {
  const server = new McpServer({ name: "build-for-ireland-eirgrid-energy", version: "0.7.0" });

  server.registerTool(
    "get_system_data",
    {
      description: "Get one electricity system series for one day from EirGrid's Smart Grid Dashboard: demand, generation, wind, solar, CO2, interconnection, frequency, SNSP, or fuel mix. Returns a per-field summary and a bounded list of readings. Unofficial endpoint; units are the dashboard's labels.",
      inputSchema: z.object({
        series: z.enum(SERIES_NAMES).describe("Which series to read. fuel_mix is always the latest 24 hours and ignores the date."),
        region: z.enum(["ALL", "ROI", "NI"]).default("ALL").describe("ALL (all-island), ROI (Ireland), or NI (Northern Ireland)."),
        date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, "Use YYYY-MM-DD.").optional().describe("Day to read, as YYYY-MM-DD in Irish local time. Defaults to today."),
        limit: z.number().int().min(1).max(400).default(96).describe("Maximum number of readings to return, most recent last (1–400). The summary always covers the whole day."),
      }),
    },
    async ({ series, region, date, limit }) => {
      try {
        const day = date ?? todayInIreland();
        const dashboardDate = toDashboardDate(day);
        const { area, unit, interval } = SERIES[series];
        // Built by hand: the dashboard needs "+" between date and time, which URLSearchParams would encode.
        const url = `${CHART_URL}?region=${region}&chartType=default&dateRange=day&dateFrom=${dashboardDate}+00:00&dateTo=${dashboardDate}+23:59&areas=${area}`;
        const payload = await fetchJson<{ Rows?: ChartRow[] }>(url, { source: SOURCE, timeoutMs: 30_000 });
        // Some series ignore the requested range, so keep only the requested day (fuel mix is a current snapshot).
        const rows = (payload.Rows ?? []).filter((row) => series === "fuel_mix" || row.EffectiveTime?.startsWith(dashboardDate));
        const readings = rows.filter((row) => row.Value !== null && row.Value !== undefined);

        return jsonResult({
          source: "https://www.smartgriddashboard.com",
          series,
          region,
          date: series === "fuel_mix" ? "latest 24 hours" : day,
          unit,
          interval,
          totalReadings: readings.length,
          summary: summariseRows(readings),
          returned: Math.min(readings.length, limit),
          truncated: readings.length > limit,
          readings: readings.slice(-limit).map((row) => ({ time: row.EffectiveTime, field: row.FieldName, region: row.Region, value: row.Value })),
          note: NOTE,
        });
      } catch (error) {
        return asToolError(error, "Unexpected EirGrid error.");
      }
    },
  );

  return server;
}

runStdio(import.meta.url, "eirgrid-energy", createServer);
