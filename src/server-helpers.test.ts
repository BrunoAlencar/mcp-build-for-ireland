import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { asToolError, fetchJson, fetchText, jsonResult, UpstreamHttpError } from "./server-helpers.js";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

test("fetchJson returns the parsed body and sends a user agent", async () => {
  let headers: Headers | undefined;
  globalThis.fetch = async (_url, init) => {
    headers = new Headers(init?.headers);
    return new Response('{"ok":true}');
  };
  assert.deepEqual(await fetchJson("https://example.test", { source: "test API" }), { ok: true });
  assert.match(headers?.get("user-agent") ?? "", /build-for-ireland-mcp/);
});

test("an upstream HTTP error names the source and status", async () => {
  globalThis.fetch = async () => new Response("nope", { status: 503 });
  await assert.rejects(fetchText("https://example.test", { source: "test API" }), (error: unknown) => {
    assert.ok(error instanceof UpstreamHttpError);
    assert.equal(error.status, 503);
    assert.equal(error.message, "The test API returned HTTP 503.");
    return true;
  });
});

test("a timeout and a network failure produce understandable messages", async () => {
  globalThis.fetch = async () => { throw Object.assign(new Error("aborted"), { name: "TimeoutError" }); };
  await assert.rejects(fetchText("https://example.test", { source: "test API", timeoutMs: 2000 }), /test API request timed out after 2 seconds/);

  globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
  await assert.rejects(fetchText("https://example.test", { source: "test API" }), /Could not connect to the test API/);
});

test("fetchJson rejects a body that is not JSON", async () => {
  globalThis.fetch = async () => new Response("<html>");
  await assert.rejects(fetchJson("https://example.test", { source: "test API" }), /not valid JSON/);
});

test("tool results and errors use the MCP text shape", () => {
  assert.deepEqual(jsonResult({ a: 1 }), { content: [{ type: "text", text: '{\n  "a": 1\n}' }] });
  assert.deepEqual(asToolError(new Error("boom"), "fallback"), { content: [{ type: "text", text: "boom" }], isError: true });
  assert.equal(asToolError("not an error", "fallback").content[0].text, "fallback");
});
