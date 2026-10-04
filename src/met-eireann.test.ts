import assert from "node:assert/strict";
import { test } from "node:test";
import { flattenTextForecast, parseCsv, parsePointForecast } from "./met-eireann.js";

const XML = `<weatherdata created="2026-10-04T14:31:46Z"><meta>
<model name="harmonie" termin="2026-10-04T06:00:00Z" runended="2026-10-04T09:19:42Z" nextrun="2026-10-04T16:00:00Z" from="2026-10-04T15:00:00Z" to="2026-10-06T12:00:00Z"/>
</meta><product class="pointData">
<time datatype="forecast" from="2026-10-04T16:00:00Z" to="2026-10-04T16:00:00Z"><location altitude="39" latitude="53.3500" longitude="-6.2600"><temperature id="TTT" unit="celsius" value="19.0"/><windDirection id="dd" deg="229.5" name="SW"/><windSpeed id="ff" mps="4.0" beaufort="3" name="Gentle breeze"/><windGust id="ff_gust" mps="10.1"/><humidity value="73.2" unit="percent"/><pressure id="pr" unit="hPa" value="1024.9"/><cloudiness id="NN" percent="89.6"/></location></time>
<time datatype="forecast" from="2026-10-04T15:00:00Z" to="2026-10-04T16:00:00Z"><location altitude="39" latitude="53.3500" longitude="-6.2600"><precipitation unit="mm" value="0.2" minvalue="0.0" maxvalue="0.5" probability="35.0"/><symbol id="LightRain" number="5"/></location></time>
<time datatype="forecast" from="2026-10-04T15:00:00Z" to="2026-10-04T15:00:00Z"><location altitude="39" latitude="53.3500" longitude="-6.2600"><temperature id="TTT" unit="celsius" value="19.6"/><windSpeed id="ff" mps="4.7" beaufort="3" name="Gentle breeze"/></location></time>
<time datatype="forecast" from="2026-10-04T16:00:00Z" to="2026-10-04T17:00:00Z"><location altitude="39" latitude="53.3500" longitude="-6.2600"><precipitation unit="mm" value="0.0" probability="0.0"/><symbol id="Cloud" number="4"/></location></time>
</product></weatherdata>`;

test("parsePointForecast merges instant values with the hour's precipitation, in time order", () => {
  const forecast = parsePointForecast(XML, 10);
  assert.equal(forecast.created, "2026-10-04T14:31:46Z");
  assert.deepEqual(forecast.models, [{
    name: "harmonie",
    runTime: "2026-10-04T06:00:00Z",
    nextRun: "2026-10-04T16:00:00Z",
    validFrom: "2026-10-04T15:00:00Z",
    validTo: "2026-10-06T12:00:00Z",
  }]);
  // The 17:00 entry has precipitation only, so it is not a full forecast hour.
  assert.equal(forecast.totalHours, 2);
  assert.deepEqual(forecast.hours.map((hour) => hour.time), ["2026-10-04T15:00:00Z", "2026-10-04T16:00:00Z"]);
  assert.deepEqual(forecast.hours[1], {
    time: "2026-10-04T16:00:00Z",
    temperatureC: 19,
    windSpeedMps: 4,
    windGustMps: 10.1,
    windDirection: "SW",
    humidityPercent: 73.2,
    pressureHpa: 1024.9,
    cloudPercent: 89.6,
    precipitationMm: 0.2,
    precipitationProbabilityPercent: 35,
    symbol: "LightRain",
  });
});

test("parsePointForecast limits the hours and tolerates an empty document", () => {
  assert.equal(parsePointForecast(XML, 1).hours.length, 1);
  assert.deepEqual(parsePointForecast("<weatherdata></weatherdata>", 5), { created: undefined, models: [], totalHours: 0, hours: [] });
});

test("flattenTextForecast merges the single-key region objects", () => {
  const forecasts = flattenTextForecast({
    forecasts: [{ regions: [{ region: "National" }, { issued: "2026-10-04T14:00:00Z" }, { today: "Mostly cloudy." }] }],
  });
  assert.deepEqual(forecasts, [{ region: "National", issued: "2026-10-04T14:00:00Z", today: "Mostly cloudy." }]);
  assert.deepEqual(flattenTextForecast({}), []);
});

test("parseCsv handles quoted headers, embedded commas, and blank lines", () => {
  const rows = parseCsv('Station,"Temperature (ºC)",Weather\r\nAthenry,17,Cloudy\n"Dublin, Airport",12,"Sun / ""Clear"""\n\n');
  assert.deepEqual(rows, [
    { Station: "Athenry", "Temperature (ºC)": "17", Weather: "Cloudy" },
    { Station: "Dublin, Airport", "Temperature (ºC)": "12", Weather: 'Sun / "Clear"' },
  ]);
  assert.deepEqual(parseCsv(""), []);
});
