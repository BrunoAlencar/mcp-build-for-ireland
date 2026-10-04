import assert from "node:assert/strict";
import { test } from "node:test";
import { summariseRows, toDashboardDate, todayInIreland } from "./eirgrid-energy.js";

test("toDashboardDate converts an ISO date to the dashboard format", () => {
  assert.equal(toDashboardDate("2026-10-03"), "03-Oct-2026");
  assert.equal(toDashboardDate("2026-01-31"), "31-Jan-2026");
});

test("todayInIreland uses the Irish calendar day, not UTC", () => {
  // 23:30 UTC on 30 June is already 1 July in Ireland (UTC+1 in summer).
  assert.equal(todayInIreland(new Date("2026-06-30T23:30:00Z")), "2026-07-01");
  assert.equal(todayInIreland(new Date("2026-01-15T12:00:00Z")), "2026-01-15");
});

test("summariseRows reports min, max, mean, and latest reading per field", () => {
  const summary = summariseRows([
    { EffectiveTime: "03-Oct-2026 00:00:00", FieldName: "SYSTEM_DEMAND", Value: 4373 },
    { EffectiveTime: "03-Oct-2026 00:15:00", FieldName: "SYSTEM_DEMAND", Value: 4386 },
    { EffectiveTime: "03-Oct-2026 00:30:00", FieldName: "SYSTEM_DEMAND", Value: null },
    { EffectiveTime: "03-Oct-2026 00:00:00", FieldName: "INTER_EWIC", Value: -120 },
  ]);
  assert.deepEqual(summary, [
    { field: "SYSTEM_DEMAND", readings: 2, min: 4373, max: 4386, mean: 4379.5, latestTime: "03-Oct-2026 00:15:00", latestValue: 4386 },
    { field: "INTER_EWIC", readings: 1, min: -120, max: -120, mean: -120, latestTime: "03-Oct-2026 00:00:00", latestValue: -120 },
  ]);
  assert.deepEqual(summariseRows([]), []);
});
