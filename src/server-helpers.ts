import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

export const REQUEST_TIMEOUT_MS = 15_000;
const USER_AGENT = "build-for-ireland-mcp/0.8.0";

export type UpstreamRequest = {
  // Name used in error messages, such as "data.gov.ie catalog".
  source: string;
  timeoutMs?: number;
  method?: "GET" | "POST" | "HEAD";
  headers?: Record<string, string>;
  body?: string;
};

export class UpstreamHttpError extends Error {
  constructor(source: string, readonly status: number) {
    super(`The ${source} returned HTTP ${status}.`);
  }
}

export async function fetchUpstream(url: string | URL, request: UpstreamRequest): Promise<Response> {
  const timeoutMs = request.timeoutMs ?? REQUEST_TIMEOUT_MS;
  let response: Response;
  try {
    response = await fetch(url, {
      method: request.method ?? "GET",
      headers: { "user-agent": USER_AGENT, ...request.headers },
      body: request.body,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? `The ${request.source} request timed out after ${timeoutMs / 1000} seconds.`
      : `Could not connect to the ${request.source}.`;
    throw new Error(message, { cause: error });
  }

  if (!response.ok) {
    throw new UpstreamHttpError(request.source, response.status);
  }
  return response;
}

export async function fetchJson<T>(url: string | URL, request: UpstreamRequest): Promise<T> {
  const response = await fetchUpstream(url, { ...request, headers: { accept: "application/json", ...request.headers } });
  try {
    return await response.json() as T;
  } catch (error) {
    throw new Error(`The ${request.source} returned a response that was not valid JSON.`, { cause: error });
  }
}

export async function fetchText(url: string | URL, request: UpstreamRequest): Promise<string> {
  return (await fetchUpstream(url, request)).text();
}

export function jsonResult(output: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }] };
}

export function asToolError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

// Starts the stdio server only when the module is the process entry point, so tests can import it.
export function runStdio(moduleUrl: string, name: string, createServer: () => McpServer) {
  const entry = process.argv[1];
  if (!entry) return;
  try {
    if (realpathSync(entry) !== realpathSync(fileURLToPath(moduleUrl))) return;
  } catch {
    return;
  }
  void serveStdio(createServer);
  console.error(`${name} MCP server running on stdio`);
}
