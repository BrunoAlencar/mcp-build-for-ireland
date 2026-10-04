import assert from "node:assert/strict";
import { test } from "node:test";
import { checkFilters, describeTable, flattenDataset, searchTables, summariseCollection, type JsonStatDataset } from "./cso-statistics.js";

const DATASET: JsonStatDataset = {
  id: ["STATISTIC", "TLIST(A1)", "STATUS"],
  size: [1, 2, 2],
  label: "River water quality",
  updated: "2025-12-03T11:00:00.000Z",
  role: { metric: ["STATISTIC"], time: ["TLIST(A1)"] },
  extension: { matrix: "EIIA13", copyright: { name: "Environmental Protection Agency" } },
  dimension: {
    STATISTIC: { label: "Statistic", category: { index: ["C01"], label: { C01: "River water quality" }, unit: { C01: { label: "%" } } } },
    "TLIST(A1)": { label: "Year", category: { index: ["2019", "2022"], label: { "2019": "2019", "2022": "2022" } } },
    STATUS: { label: "Ecological Status", category: { index: { "11": 1, "12": 0 }, label: { "12": "High", "11": "Good" } } },
  },
  value: [10, 40, 12, null],
};

test("flattenDataset labels every cell in JSON-stat order and carries the unit", () => {
  const { totalCells, rows } = flattenDataset(DATASET, 10);
  assert.equal(totalCells, 4);
  assert.deepEqual(rows, [
    { Statistic: "River water quality", Year: "2019", "Ecological Status": "High", value: 10, unit: "%" },
    { Statistic: "River water quality", Year: "2019", "Ecological Status": "Good", value: 40, unit: "%" },
    { Statistic: "River water quality", Year: "2022", "Ecological Status": "High", value: 12, unit: "%" },
    { Statistic: "River water quality", Year: "2022", "Ecological Status": "Good", value: null, unit: "%" },
  ]);
});

test("flattenDataset stops at the row limit but reports the full size", () => {
  const { totalCells, rows } = flattenDataset(DATASET, 1);
  assert.equal(totalCells, 4);
  assert.equal(rows.length, 1);
});

test("checkFilters returns the filtered cell count", () => {
  assert.equal(checkFilters(DATASET, {}), 4);
  assert.equal(checkFilters(DATASET, { "TLIST(A1)": ["2022"] }), 2);
});

test("checkFilters rejects unknown dimensions and category codes", () => {
  assert.throws(() => checkFilters(DATASET, { COUNTY: ["Dublin"] }), /"COUNTY" is not a dimension.*STATISTIC, TLIST\(A1\), STATUS/);
  assert.throws(() => checkFilters(DATASET, { STATUS: ["12", "99"] }), /Unknown category code\(s\) for STATUS: 99/);
});

test("describeTable lists dimensions with roles, categories, and units", () => {
  const table = describeTable(DATASET);
  assert.equal(table.code, "EIIA13");
  assert.equal(table.totalCells, 4);
  assert.deepEqual(table.dimensions.map((dimension) => dimension.role), ["statistic", "time", "classification"]);
  assert.deepEqual(table.dimensions[0].categories, [{ code: "C01", label: "River water quality", unit: "%" }]);
  assert.deepEqual(table.dimensions[2].categories.map((category) => category.code), ["12", "11"]);
});

test("searchTables matches every term across code, title, and dimensions, newest first", () => {
  const tables = summariseCollection([
    { label: "River water quality", updated: "2020-01-01", extension: { matrix: "OLD01" }, dimension: { A: { label: "Year" } } },
    { label: "River water quality", updated: "2025-12-03", extension: { matrix: "EIIA13", copyright: { name: "EPA" } }, dimension: { A: { label: "Ecological Status" } } },
    { label: "Lake water quality", updated: "2026-01-01", extension: { matrix: "LAKE1" } },
    { label: "No code" },
  ]);
  assert.equal(tables.length, 3);

  const result = searchTables(tables, "RIVER quality", 1);
  assert.equal(result.totalMatches, 2);
  assert.equal(result.tables[0].code, "EIIA13");
  assert.equal(searchTables(tables, "ecological river", 5).totalMatches, 1);
  assert.equal(searchTables(tables, "eiia13", 5).tables[0].publisher, "EPA");
});
