# Architecture

## Runtime shape

The project is a plain Vite + React + TypeScript Chrome Manifest V3 extension.

```text
Chrome action
    |
    v
Side Panel page (sidepanel.html -> src/sidepanel.tsx -> src/App.tsx)
    |
    +--> Ollama API on localhost / 127.0.0.1
    +--> IndexedDB for conversations and messages
    +--> chrome.storage.local for settings

Service worker (src/extension/service-worker.ts)
    |
    +--> configures openPanelOnActionClick
```

## Source boundaries

- `src/sidepanel.tsx` mounts the React application used by the Side Panel.
- `src/App.tsx` coordinates the primary UI and existing application workflows.
- `src/hooks/useLocalAI.ts` owns chat/preflight state and generation lifecycle.
- `src/lib/ollama.ts` calls `/api/tags` and `/api/chat`, parses streamed NDJSON, and preserves AbortController cancellation.
- `src/lib/db.ts` stores conversations and messages in IndexedDB.
- `src/lib/settings.ts` stores settings in `chrome.storage.local`, with a browser-development fallback.
- `src/lib/theme.ts` resolves Auto/Light/Dark appearance without a network dependency.
- `src/lib/local-endpoint.ts` enforces loopback-only endpoints.
- `src/extension/service-worker.ts` is intentionally small and does not proxy model traffic.

## Build output

Vite emits `dist/manifest.json`, `dist/sidepanel.html`, `dist/service-worker.js`, hashed assets, and icons. `scripts/verify-extension-package.mjs` checks the unpacked package, while `scripts/package-extension.mjs` creates the release ZIP with no nested `dist/` directory.

## Data flow

1. The Side Panel loads settings and persisted conversations.
2. Preflight calls Ollama `/api/tags` and selects a still-installed model, preferring `gemma4:e4b` when no valid prior selection exists.
3. Chat sends the current conversation to Ollama `/api/chat` with streaming enabled.
4. NDJSON frames update the assistant message incrementally.
5. AbortController stops the active request while retaining partial output.
6. Completed or stopped messages are persisted in IndexedDB.

## Security boundaries

The extension has no content scripts and no webpage access. React renders model text as text; it does not use raw HTML rendering. Runtime network code is limited to the two loopback Ollama origins in the manifest and endpoint validator.
