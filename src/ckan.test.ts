import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ckanGet, compactDataset, type CkanSite } from "./ckan.js";

const SITE: CkanSite = {
  apiRoot: "https://catalog.test/api/3/action",
  siteUrl: "https://catalog.test",
  source: "test catalog",
  description: "the test catalog",
};

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

test("ckanGet builds the action URL and unwraps the result", async () => {
  let requested = "";
  globalThis.fetch = async (url) => {
    requested = String(url);
    return new Response(JSON.stringify({ success: true, result: { count: 2 } }));
  };
  assert.deepEqual(await ckanGet(SITE, "package_search", { q: "bus stops", rows: "5" }), { count: 2 });
  assert.equal(requested, "https://catalog.test/api/3/action/package_search?q=bus+stops&rows=5");
});

test("ckanGet surfaces the catalog's own error message", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, error: { message: "Not found" } }));
  await assert.rejects(ckanGet(SITE, "package_show", { id: "missing" }), /^Error: Not found$/);

  globalThis.fetch = async () => new Response(JSON.stringify({ success: false }));
  await assert.rejects(ckanGet(SITE, "package_show", { id: "missing" }), /test catalog returned an unsuccessful response/);
});

test("compactDataset maps catalog fields and falls back to a site URL", () => {
  const compact = compactDataset({
    id: "abc",
    name: "luas-stops",
    title: "Luas Stops",
    notes: "Stop locations",
    license_title: "CC BY 4.0",
    license_id: "cc-by",
    organization: { name: "sdcc", title: "South Dublin County Council" },
    tags: [{ display_name: "Transport" }, { name: "luas" }],
    resources: [{ id: "r1", format: "CSV", url: "https://files.test/luas.csv", last_modified: "2026-01-01", datastore_active: true }],
  }, SITE.siteUrl);

  assert.equal(compact.organization, "South Dublin County Council");
  assert.equal(compact.license, "CC BY 4.0");
  assert.equal(compact.catalogUrl, "https://catalog.test/dataset/luas-stops");
  assert.deepEqual(compact.tags, ["Transport", "luas"]);
  assert.deepEqual(compact.resources?.[0], {
    id: "r1",
    name: undefined,
    description: undefined,
    format: "CSV",
    url: "https://files.test/luas.csv",
    created: undefined,
    lastModified: "2026-01-01",
    datastoreActive: true,
  });
});
