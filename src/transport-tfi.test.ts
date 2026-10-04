import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { mapTripUpdate, mapVehicle, readRealtime } from "./transport-tfi.js";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

test("readRealtime refuses to call the API without a key and says how to get one", async () => {
  globalThis.fetch = async () => { throw new Error("must not be called"); };
  await assert.rejects(readRealtime("TripUpdates", ""), /needs a subscription key.*NTA_API_KEY/);
});

test("readRealtime sends the key as a header and explains a rejected key", async () => {
  let key: string | null = null;
  globalThis.fetch = async (_url, init) => {
    key = new Headers(init?.headers).get("x-api-key");
    return new Response("denied", { status: 401 });
  };
  await assert.rejects(readRealtime("Vehicles", "secret-key"), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /rejected the subscription key/);
    assert.ok(!error.message.includes("secret-key"));
    return true;
  });
  assert.equal(key, "secret-key");
});

test("readRealtime caches a feed so the NTA is called at most once a minute", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ header: { timestamp: "1" }, entity: [] }));
  };
  assert.equal((await readRealtime("TripUpdates", "k")).cached, false);
  assert.equal((await readRealtime("TripUpdates", "k")).cached, true);
  assert.equal(calls, 1);
});

test("mapTripUpdate reads snake_case and camelCase feeds", () => {
  const snake = mapTripUpdate({
    trip_update: {
      trip: { trip_id: "T1", route_id: "R1", start_date: "20261004", schedule_relationship: "SCHEDULED" },
      stop_time_update: [{ stop_id: "S1", stop_sequence: 3, arrival: { delay: 120 }, departure: { delay: 90 } }, { stop_id: "S2" }],
    },
  }, 1);
  assert.equal(snake?.tripId, "T1");
  assert.equal(snake?.routeId, "R1");
  assert.deepEqual(snake?.stops, [{ stopId: "S1", sequence: 3, arrivalDelaySeconds: 120, departureDelaySeconds: 90, scheduleRelationship: undefined }]);

  const camel = mapTripUpdate({ tripUpdate: { trip: { tripId: "T2", routeId: "R2" }, stopTimeUpdate: [{ stopId: "S9" }] } }, 5);
  assert.equal(camel?.tripId, "T2");
  assert.equal(camel?.stops[0].stopId, "S9");

  assert.equal(mapTripUpdate({ vehicle: {} }, 5), undefined);
});

test("mapVehicle maps position and trip, and skips non-vehicle entities", () => {
  assert.deepEqual(mapVehicle({
    vehicle: { trip: { trip_id: "T1", route_id: "R1" }, position: { latitude: 53.35, longitude: -6.26 }, timestamp: "1791100000", vehicle: { id: "V7" } },
  }), { vehicleId: "V7", tripId: "T1", routeId: "R1", latitude: 53.35, longitude: -6.26, timestamp: "1791100000" });
  assert.equal(mapVehicle({ trip_update: {} }), undefined);
});
