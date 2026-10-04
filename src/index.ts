import { McpServer } from "@modelcontextprotocol/server";
import { registerCatalogTools, type CkanSite } from "./ckan.js";
import { runStdio } from "./server-helpers.js";

const SITE: CkanSite = {
  apiRoot: "https://data.gov.ie/api/3/action",
  siteUrl: "https://data.gov.ie",
  source: "data.gov.ie catalog",
  description: "Ireland's official data.gov.ie catalog",
};

export function createServer() {
  const server = new McpServer({ name: "build-for-ireland-data-gov-ie", version: "0.1.0" });
  registerCatalogTools(server, SITE);
  return server;
}

runStdio(import.meta.url, "data.gov.ie", createServer);
