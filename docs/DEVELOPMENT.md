# Development

## Local workflow

Install dependencies with the repository's lockfile:

```sh
pnpm install
```

Run the complete local check set:

```sh
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify:extension
pnpm run package
```

The scripts intentionally verify a production extension package rather than only a web page.

## Useful commands

- `pnpm run dev` starts Vite for ordinary local browser/component work.
- `pnpm run build` creates `dist/`.
- `pnpm run verify:extension` checks manifest values and referenced build files.
- `pnpm run package` rebuilds and writes the release ZIP.
- `pnpm run test` runs the focused Vitest suite.

## Extension testing

For Chrome behavior, build first and load `dist/` through `chrome://extensions`. Vite's development URL is not the production extension runtime and should not be used to claim Chrome installation or Side Panel behavior.

When Ollama returns 403, configure `OLLAMA_ORIGINS` for the actual runtime origin shown by the extension. Do not hard-code a development ID in code or documentation.

## Test scope

The tests cover endpoint policy, model preference, streamed NDJSON parsing, settings migration, theme resolution, and extension-origin helpers. Real model quality is not unit-tested; local Ollama regression checks belong in the release process.

## Change boundaries

Keep local inference local. Do not add cloud APIs, analytics, content scripts, broad permissions, or remote executable code. Changes to persistence or streaming require explicit regression testing because existing Chrome behavior depends on them.
