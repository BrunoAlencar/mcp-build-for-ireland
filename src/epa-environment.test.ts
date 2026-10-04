import assert from "node:assert/strict";
import { test } from "node:test";
import { compactBathingLocation, summariseWaterBody } from "./epa-environment.js";

test("summariseWaterBody keeps the most recent periods and separates headline status from elements", () => {
  const summary = summariseWaterBody({
    Code: "IE_EA_09D010100",
    Name: "DODDER_020",
    Type: "River",
    LocalAuthority: "South Dublin County Council",
    Tier1Risk: "At risk",
    ProtectedArea: null,
    Catchment: [{ Name: "Liffey and Dublin Bay", Code: "09" }],
    Status: [
      { Code: "SW 2007-2009", Status: [{ Name: "Ecological Status or Potential", Status: "Good", ParentId: null }] },
      {
        Code: "SW 2016-2021",
        Status: [
          { Name: "Ecological Status or Potential", Status: "Moderate", ParentId: null, AssessmentTechnique: "Monitoring", StatusConfidence: "" },
          { Name: "Invertebrate Status or Potential", Status: "Moderate", ParentId: "abc" },
        ],
      },
      { Code: "SW 2010-2015", Status: [] },
    ],
  }, 2);

  assert.equal(summary.periodsAvailable, 3);
  assert.deepEqual(summary.assessments.map((assessment) => assessment.period), ["SW 2016-2021", "SW 2010-2015"]);
  assert.deepEqual(summary.assessments[0].overall, [
    { name: "Ecological Status or Potential", status: "Moderate", technique: "Monitoring", confidence: undefined },
  ]);
  assert.deepEqual(summary.assessments[0].elements, [{ name: "Invertebrate Status or Potential", status: "Moderate" }]);
  assert.deepEqual(summary.catchment, { Name: "Liffey and Dublin Bay", Code: "09" });
  assert.equal(summary.protectedArea, undefined);
});

test("summariseWaterBody tolerates a record with no status history", () => {
  const summary = summariseWaterBody({ Code: "X", Name: "Unknown" }, 2);
  assert.equal(summary.periodsAvailable, 0);
  assert.deepEqual(summary.assessments, []);
});

test("compactBathingLocation keeps the classification and freshness fields", () => {
  const compact = compactBathingLocation({
    beach_id: "IEEABWC090_0000_0400",
    beach_name: "Sandymount Strand",
    county_name: "Dublin",
    current_annual_water_quality_classification: "Poor",
    current_annual_classification_year: 2025,
    is_blue_flag: "No",
    beach_description: "A long description that is left out.",
    last_updated: "2026-09-30T10:00:00",
  });
  assert.equal(compact.name, "Sandymount Strand");
  assert.equal(compact.classification, "Poor");
  assert.equal(compact.classificationYear, 2025);
  assert.equal(compact.lastUpdated, "2026-09-30T10:00:00");
  assert.ok(!("beach_description" in compact));
});
