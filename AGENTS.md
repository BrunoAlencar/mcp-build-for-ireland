# Repository Guidelines

## Project Structure & Module Organization

The root contains `README.md`, this guide, and the Node/TypeScript package configuration. `src/` contains MCP server code; `docs/` holds the participant guide and release plan. Keep future provider connectors in focused modules. Keep generated `dist/`, dependencies, and local environment files out of source control.

## Build, Test, and Development Commands

Use Node.js 20 or later. Run `npm install` to install dependencies, `npm run dev` to launch the stdio MCP server locally, `npm run build` to compile TypeScript into `dist/`, and `npm start` to run the compiled server. MCP stdio reserves stdout for protocol messages; send diagnostics to stderr.

## Coding Style & Naming Conventions

Use TypeScript with strict compiler settings. Use descriptive kebab-case filenames (for example, `data-gov-ie.ts`), camelCase for functions and variables, and PascalCase for types. Validate all tool inputs with Zod and keep remote API handlers read-only unless a later release explicitly needs writes. Keep credentials out of source control; provide safe defaults or an example environment file instead.

## Testing Guidelines

Run `npm test`, which uses Node's built-in test runner through `tsx`. Add focused tests with each behavior change, use `*.test.ts` naming next to the module in `src/`, and cover input validation, upstream API errors, and response mapping.

## Commit & Pull Request Guidelines

Git history is not available in this directory, so no established commit format can be inferred. Use concise, imperative commit subjects that describe one change (for example, `Add project setup instructions`). Pull requests should explain the behavior change, note relevant validation commands and results, link any related issue, and include screenshots for visible UI changes.

## Security & Configuration

Never commit credentials, tokens, or personal environment files. Document required settings and keep a sanitized example such as `.env.example` when configuration is introduced.
