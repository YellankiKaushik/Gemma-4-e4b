# Codex Project Audit - Local AI Chrome Extension

Audit date: 2026-08-29  
Repository: `C:\Users\YellankiKaushik\Desktop\Projects\Personal - Codex x Gemma\Gemma App - Coding Files`

## Executive Summary

This repository is not currently a buildable Chrome Manifest V3 extension. It is a Lovable/TanStack Start React web application that implements a substantial local Ollama chat core. The Ollama integration is real: model discovery calls `/api/tags`, chat calls `/api/chat`, streaming uses `response.body.getReader()` plus `TextDecoder`, and generation cancellation uses `AbortController`.

The intended Chrome extension wrapper is missing. There is no source `manifest.json`, no generated extension `manifest.json`, no `side_panel` declaration, no toolbar/action declaration, no extension service worker, and no host permissions for Ollama. The production build succeeds, but it emits a Nitro/Cloudflare web app under `.output`, not a loadable unpacked Chrome extension.

Key runtime evidence:

- VERIFIED BY EXECUTION: `pnpm run build` passed and produced `.output/public` plus `.output/server`.
- VERIFIED BY EXECUTION: `.\node_modules\.bin\tsc.cmd --noEmit` passed.
- VERIFIED BY EXECUTION: `pnpm run lint` failed with 6,375 problems, dominated by Prettier CRLF/formatting errors.
- VERIFIED BY EXECUTION: `GET http://localhost:11434/api/tags` succeeded and found `gemma4:e4b` plus `gemma4-lab:latest`.
- VERIFIED BY EXECUTION: `POST http://localhost:11434/api/chat` with `gemma4:e4b` returned exactly `LOCAL_AI_TEST_OK`.
- VERIFIED BY EXECUTION: the Ollama stream arrived as 8 NDJSON frames over 8 readable chunks.
- VERIFIED BY EXECUTION: aborting an active chat fetch produced `AbortError`.
- NOT VERIFIED: Chrome GUI loading, side-panel behavior, extension toolbar behavior, and Chrome Web Store installability, because no extension artifact exists.

## Repository And Architecture Actually Present

VERIFIED BY STATIC CODE INSPECTION:

- `package.json:6-11` defines only web scripts: `dev`, `build`, `build:dev`, `preview`, `lint`, and `format`.
- `package.json:48` depends on `@tanstack/react-start`.
- `package.json:73` depends on `@lovable.dev/vite-tanstack-config`.
- `vite.config.ts:7-13` imports Lovable's TanStack config and configures TanStack Start server entry, not an extension build.
- `README.md` is the default Lovable project README, not extension load/unpacked documentation.
- `src/routes/index.tsx` is the main React route and app shell.
- `src/hooks/useLocalAI.ts` owns preflight, chat orchestration, persistence calls, settings updates, stop, export, and clear-all.
- `src/lib/ollama.ts` is the Ollama HTTP client.
- `src/lib/db.ts` is the IndexedDB repository.
- `src/lib/settings.ts` stores settings in `localStorage`, not `chrome.storage.local`.
- `src/lib/lovable-error-reporting.ts` contains Lovable editor error-reporting hooks.

No actual Chrome extension architecture exists in source:

- `rg -n "manifest_version|side_panel|sidePanel|service_worker|host_permissions|chrome.sidePanel|chrome.storage|chrome.runtime|chrome.action"` found no implementation source matches. Matches were only in the untrusted/generated architecture document when it briefly existed during diagnostics, not in app source.
- There is no `manifest.json` in the repository or build output.
- There is no service-worker/background script for Chrome.
- There is no side-panel HTML entry.
- There are no icons declared for an extension.

## Chrome Extension Verification

VERIFIED BY EXECUTION:

- Command: `pnpm run build`
- Exit status: `0`
- Output: `.output/public` and `.output/server`
- Important output: Nitro preset `cloudflare-module`; generated `.output/server/wrangler.json`; generated `.output/public/_headers`.

VERIFIED BY EXECUTION:

- `Test-Path .output\public\manifest.json`: `False`
- `Test-Path .output\public\sidepanel.html`: `False`
- `Test-Path .output\public\service-worker.js`: `False`
- `Test-Path .output\public\index.html`: `False`

Chrome extension checks:

- Manifest V3: FAIL. No manifest exists.
- Built output contains valid `manifest.json`: FAIL.
- Chrome Side Panel configured: FAIL.
- Toolbar/action behavior configured: FAIL.
- Service worker/background entry valid: FAIL.
- Manifest paths match generated build files: FAIL, because no manifest exists.
- Development-only URLs required: not applicable to extension; web output is server-oriented.
- Remote executable code: no remote imports found in source, but extension CSP cannot be evaluated without a manifest.
- Required permissions declared: FAIL, because no extension permissions are declared.
- Unnecessary permissions declared: PASS by absence, but this is not meaningful because there is no manifest.
- `<all_urls>`: not requested in source.
- Local Ollama host permissions: FAIL. No manifest means no `http://localhost:11434/*` or `http://127.0.0.1:11434/*`.

Final manifest permissions exactly:

```text
N/A - no source or build manifest.json exists, so there are no actual Chrome extension permissions.
```

## Build Verification

Dependency install:

- Command: `npm install --no-package-lock`
- Exit status: `1`
- Result: local `npm` shim is broken: it points to missing `C:\Users\YellankiKaushik\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js`.

- Command: `bun --version`
- Exit status: `1`
- Result: `bun` is not installed, despite the checked-in `bun.lock`.

- Command: `pnpm install --lockfile=false`
- First exit status: interrupted after sandbox network `EACCES` retry loop.
- Second exit status: `0`, after approved network access.
- Caveat: this did not use the checked-in `bun.lock`; it was a diagnostic fallback because Bun was unavailable and npm was broken.
- Warnings: deprecated `eslint@9.39.5`; deprecated `recharts@2.15.4`; peer dependency warnings.

Build:

- Command: `pnpm run build`
- Exit status: `0`
- Warnings:
  - Vite reports `vite-tsconfig-paths` can be removed because Vite now supports native tsconfig paths.
  - Plugin timings show most build time in `vite-tsconfig-paths` and `tanstack-start-core:import-protection`.
  - Nitro warning: `inlineDynamicImports option is ignored because the codeSplitting option is specified`.
- Generated output:
  - `.output/public/assets/index-CslEWe9l.js`
  - `.output/public/assets/routes-CdJcuTXq.js`
  - `.output/public/assets/styles-D0HhqOA3.css`
  - `.output/server/index.mjs`
  - `.output/server/wrangler.json`
  - `.output/nitro.json`
- Loadable as unpacked Chrome extension: FAIL. No manifest or side-panel entry exists.

TypeScript:

- Command: `pnpm exec tsc --noEmit`
- Exit status: `1`
- Result: `tsc` was not found through pnpm's exec shim.

- Command: `.\node_modules\.bin\tsc.cmd --noEmit`
- Exit status: `0`
- Result: TypeScript passed.

Lint:

- Command: `pnpm run lint`
- Exit status: `1`
- Important result: `6375 problems (6369 errors, 6 warnings)`.
- Dominant issue: Prettier formatting/line-ending errors such as `Delete CR` across source and config files.
- Example evidence: `eslint.config.js`, `src/components/ChatView.tsx`, `src/server.ts`, `src/start.ts`, and `vite.config.ts`.

Tests:

- Command: `pnpm run`
- Exit status: `0`
- Result: available scripts are only `dev`, `build`, `build:dev`, `preview`, `lint`, and `format`.
- Unit tests: NOT AVAILABLE.
- Integration tests: NOT AVAILABLE.
- E2E tests: NOT AVAILABLE.

## Ollama Connectivity Verification

VERIFIED BY STATIC CODE INSPECTION:

- `src/lib/ollama.ts:4` sets `DEFAULT_ENDPOINT = "http://localhost:11434"`.
- `src/lib/ollama.ts:27-45` implements `listModels(endpoint, timeoutMs = 3000)`.
- `src/lib/ollama.ts:28-33` uses an `AbortController` and calls `${normalizeEndpoint(endpoint)}/api/tags`.
- `src/lib/ollama.ts:45-61` parses actual Ollama `models` data.
- `src/hooks/useLocalAI.ts:37-58` runs preflight, updates runtime state, handles empty model lists, and catches runtime failures.
- `src/components/RuntimePanel.tsx:17-28` renders checking/unavailable/no-model states.
- `src/components/RuntimePanel.tsx:85` exposes a retry button.

VERIFIED BY EXECUTION:

Command:

```powershell
Invoke-RestMethod -Uri 'http://localhost:11434/api/tags' -Method GET -TimeoutSec 5
```

Exit status: `0`

Relevant installed models:

| Model | Size | Parameter size | Quantization |
| --- | ---: | --- | --- |
| `gemma4-lab:latest` | 9608350695 | 8.0B | Q4_K_M |
| `gemma4:e4b` | 9608350718 | 8.0B | Q4_K_M |

Findings:

- Ollama reachability detection exists.
- Connection failures produce an explicit UI state.
- Model discovery uses actual Ollama data, not a fake list.
- Empty model lists are handled with `runtimeState = "no_models"`.
- Network/CORS/origin failures collapse to `LOCAL_RUNTIME_UNREACHABLE`; the UI gives origin guidance but does not distinguish CORS from daemon-down.
- Retry exists.

## Gemma Detection Verification

VERIFIED BY STATIC CODE INSPECTION:

- `src/lib/ollama.ts:67-78` implements `resolvePreferredModel`.
- Exact current behavior:
  1. If any installed model name is exactly `gemma4:e4b`, return `gemma4:e4b`.
  2. Else if `gemma4:latest` exists, return `gemma4:latest`.
  3. Else return the first name starting with `gemma4:` or `gemma`.
  4. Else preserve `previouslySelected` only if it exists in the installed list.
  5. Else return the first discovered model.
  6. Else return `null`.

VERIFIED BY EXECUTION:

- This machine has `gemma4:e4b`, so the algorithm should select `gemma4:e4b`.

Assessment:

- Desired exact `gemma4:e4b` preference: PASS.
- Does not fake Gemma: PASS.
- Allows other models if no Gemma: PASS.
- Caveat: every preflight will override a valid previously selected non-Gemma model when `gemma4:e4b` exists. That may be intended by the stated preference, but it should be a conscious UX decision.

## Real Chat Verification

VERIFIED BY STATIC CODE INSPECTION:

- `src/hooks/useLocalAI.ts:122-229` implements `send`.
- `src/hooks/useLocalAI.ts:143` persists the user message before request.
- `src/hooks/useLocalAI.ts:164-169` sends recent non-system, non-error conversation messages bounded by `settings.historyLimit`.
- `src/hooks/useLocalAI.ts:171-173` prepends `settings.systemPrompt` as a `system` role when configured.
- `src/hooks/useLocalAI.ts:185-194` calls `chatStream` with `settings.endpoint`, selected `model`, `payload`, and `settings.temperature`.
- `src/lib/ollama.ts:80-101` posts to `${endpoint}/api/chat` with `model`, `messages`, `stream: true`, and `options.temperature`.
- `src/lib/ollama.ts:103-109` maps 404/not-found style errors to `MODEL_NOT_FOUND`; other failed responses become `MODEL_REQUEST_REJECTED`.
- `src/lib/ollama.ts:134-139` maps Ollama error stream frames, including context-related messages.

VERIFIED BY EXECUTION:

Command: Node `fetch` to `POST http://localhost:11434/api/chat` with:

```json
{
  "model": "gemma4:e4b",
  "messages": [{ "role": "user", "content": "Reply with exactly: LOCAL_AI_TEST_OK" }],
  "stream": true,
  "options": { "temperature": 0 }
}
```

Exit status: `0`

Result:

```text
HTTP_STATUS=200
FRAMES=8
FINAL_TEXT="LOCAL_AI_TEST_OK"
```

Assessment:

- Real local inference tested: PASS.
- Selected model is used: PASS.
- Conversation roles are correct by code inspection: PASS.
- System prompt is included by code inspection: PASS.
- Model-not-found and context errors are handled by code inspection: PARTIAL, not execution-tested.
- Malformed response handling exists, but see streaming caveat below.

## Streaming Verification

VERIFIED BY STATIC CODE INSPECTION:

- `src/lib/ollama.ts:111` uses `res.body.getReader()`.
- `src/lib/ollama.ts:112` uses `TextDecoder`.
- `src/lib/ollama.ts:114-124` buffers incoming decoded data and parses newline-delimited frames.
- `src/lib/ollama.ts:126-131` throws `STREAM_PARSE_ERROR` on invalid JSON frames.
- `src/hooks/useLocalAI.ts:185-205` consumes the async generator and updates React state as chunks arrive.
- `src/hooks/useLocalAI.ts:228` persists only the final assistant message after completion/stop/error.

VERIFIED BY EXECUTION:

The real chat test produced:

```text
CHUNK_1_MS=16517 BYTES=129
CHUNK_2_MS=16549 BYTES=124
CHUNK_3_MS=16582 BYTES=126
CHUNK_4_MS=16609 BYTES=125
CHUNK_5_MS=16636 BYTES=128
CHUNK_6_MS=16661 BYTES=125
CHUNK_7_MS=16682 BYTES=126
CHUNK_8_MS=16704 BYTES=298
FRAMES=8
FINAL_TEXT="LOCAL_AI_TEST_OK"
```

Assessment:

REAL OLLAMA STREAMING: PASS

Why: the local Ollama endpoint returned multiple readable chunks and multiple NDJSON frames, and the app code consumes `ReadableStream` directly. This verifies transport streaming. Visual incremental rendering in Chrome Side Panel was not tested because the extension artifact does not exist.

Streaming caveats:

- If the stream ends with a final JSON line that lacks a trailing newline, `src/lib/ollama.ts:116-151` exits the read loop without parsing leftover `buffer`. Ollama normally emits newline-delimited frames, but the parser is not fully robust.
- React state updates once per content chunk in `src/hooks/useLocalAI.ts:196-200`; there is no throttling or batching for high-frequency streams.
- Partial assistant content is not persisted until finalization. Closing the page during a stream can lose the partial answer.

## Stop Generation Verification

VERIFIED BY STATIC CODE INSPECTION:

- `src/hooks/useLocalAI.ts:27` stores `abortRef`.
- `src/hooks/useLocalAI.ts:118-120` implements `stop()` by calling `abortRef.current?.abort()`.
- `src/hooks/useLocalAI.ts:175-177` creates a new `AbortController` per generation.
- `src/hooks/useLocalAI.ts:185-194` passes `controller.signal` into `chatStream`.
- `src/lib/ollama.ts:86-89` passes the signal to `fetch`.
- `src/lib/ollama.ts:94-95` maps aborted startup fetch to `REQUEST_ABORTED`.
- `src/lib/ollama.ts:144-147` maps aborted streaming reads to `REQUEST_ABORTED`.
- `src/hooks/useLocalAI.ts:206-213` marks aborted messages as `stopped`.
- `src/hooks/useLocalAI.ts:228-230` persists the stopped assistant message and returns phase to `idle`.

VERIFIED BY EXECUTION:

Command: Node `fetch` to `/api/chat`, read streaming chunks, abort after 1000 ms.

Exit status: `0`

Result:

```text
HTTP_STATUS=200
CHUNK_1_MS=487
...
CHUNK_22_MS=1006
ABORTING_MS=1006
ABORT_RESULT_NAME=AbortError
ABORT_RESULT_MS=1011
ABORT_RESULT_MESSAGE=This operation was aborted
```

STOP GENERATION: PASS

Why: the actual fetch aborts at the browser/Fetch API level, and the app code wires that abort path to a stopped message and idle UI state. Chrome side-panel visual behavior was not GUI-tested.

## Conversation Persistence Verification

VERIFIED BY STATIC CODE INSPECTION:

- `src/lib/db.ts:4` uses IndexedDB database name `local-ai-side-panel`.
- `src/lib/db.ts:15-24` creates `conversations` and `messages` object stores.
- `src/lib/db.ts:19-24` indexes conversations by `updatedAt` and messages by `[conversationId, createdAt]`.
- `src/lib/db.ts:59-61` generates UUIDs with `crypto.randomUUID()` when available.
- `src/lib/db.ts:65-72` creates conversations.
- `src/lib/db.ts:76-80` lists and sorts conversations by `updatedAt`.
- `src/lib/db.ts:84-91` fetches messages by conversation.
- `src/lib/db.ts:94-104` renames conversations.
- `src/lib/db.ts:120-127` deletes one conversation and its messages.
- `src/lib/db.ts:129-135` appends messages and touches the conversation.
- `src/lib/db.ts:146-151` clears all history.
- `src/lib/db.ts:154-158` exports all conversations/messages.

What is stored where:

- Conversations: IndexedDB, database `local-ai-side-panel`, object store `conversations`.
- Messages: IndexedDB, database `local-ai-side-panel`, object store `messages`.
- Settings: `localStorage`, key `local-ai-side-panel:settings`.
- `chrome.storage.local`: not used.

PERSISTENT HISTORY: PARTIAL

Why: the persistence implementation is real by code inspection, but browser reload/restart behavior was not executed in Chrome because the app is not packaged as an extension and no browser profile test was run.

Caveats:

- Failed IndexedDB writes generally reject; send/export/delete callers do not show dedicated storage-failure UI.
- Corrupted records are not validated or quarantined.
- Partial streaming content is not persisted until the generation finishes/stops/errors.

## Settings Verification

VERIFIED BY STATIC CODE INSPECTION:

- `src/lib/settings.ts:5` uses localStorage key `local-ai-side-panel:settings`.
- `src/lib/settings.ts:7-14` defaults endpoint, selected model, system prompt, temperature, history limit, and onboarding flag.
- `src/lib/settings.ts:16-24` loads settings from `localStorage`.
- `src/lib/settings.ts:27-33` saves settings to `localStorage`.
- `src/components/SettingsPanel.tsx:34-42` exposes endpoint control.
- `src/components/SettingsPanel.tsx:47-62` exposes model selector.
- `src/components/SettingsPanel.tsx:66-72` exposes system prompt.
- `src/components/SettingsPanel.tsx:76-86` exposes temperature.
- `src/components/SettingsPanel.tsx:89-100` exposes history depth.
- `src/hooks/useLocalAI.ts:185-194` consumes endpoint, selected model, messages, and temperature.
- `src/hooks/useLocalAI.ts:168` consumes history limit.
- `src/hooks/useLocalAI.ts:171-173` consumes system prompt.

Settings persistence: PARTIAL. Code persists settings, but reload persistence was not browser-tested.

Fake or misleading settings/control behavior:

- `src/components/SettingsPanel.tsx:42` says "Loopback only," but `src/components/SettingsPanel.tsx:39` accepts any endpoint string and `src/lib/ollama.ts:32`/`86` will fetch it. This means local-only behavior is not enforced.
- Changing endpoint only patches settings; `src/hooks/useLocalAI.ts` does not automatically rerun model discovery on endpoint change. The user must manually retry preflight, and a ready state/model list may temporarily reflect the old endpoint.
- `onboardingComplete` is saved in `src/hooks/useLocalAI.ts:48`, but no UI currently reads it.
- No theme setting is implemented.

## Export And Clear-History Verification

VERIFIED BY STATIC CODE INSPECTION:

- `src/hooks/useLocalAI.ts:243-247` clears all conversations and messages via `conversationRepository.clearAll()`, then clears in-memory UI state.
- `src/lib/db.ts:146-151` clears both IndexedDB object stores.
- `src/hooks/useLocalAI.ts:250-259` exports JSON via a local Blob and temporary `<a>` download.
- `src/lib/db.ts:154-158` exports all conversations and messages.
- `src/components/SettingsPanel.tsx:111-114` wires Export JSON and Clear all history buttons.

Export: PARTIAL. Implementation appears real and local, but not browser-click tested.

Clear history: PARTIAL. Implementation appears real and updates UI state, but not browser-click/reload tested.

Exported format:

```json
{
  "conversations": [],
  "messages": []
}
```

Actual content is the full conversation list and all messages returned by IndexedDB.

## Security Audit

VERIFIED BY STATIC CODE INSPECTION:

- LLM output rendering:
  - `src/components/MessageContent.tsx:49-70` renders text and code as React text children.
  - `src/components/MessageContent.tsx:61` renders code block content inside `<code>{...}</code>`.
  - `src/components/MessageContent.tsx:66` renders text block content inside `<p>{...}</p>`.
  - No `dangerouslySetInnerHTML` is used for model output.
- `src/components/ui/chart.tsx:73` uses `dangerouslySetInnerHTML` for generated CSS variables. This component is not used in the current app path and does not render LLM output, but it should validate color inputs if ever exposed to untrusted data.
- `rg` found no `eval(` or `new Function` in project source.
- `rg` found no remote JS/CDN imports in project source.
- No `chrome.runtime` message-passing code exists, so no message validation issue exists yet.
- No content scripts exist, so no webpage data flows into privileged operations yet.
- No committed `.env` files were found in the scoped project-file scan.
- No obvious API keys or provider tokens were found in source.
- `src/lib/lovable-error-reporting.ts:26-56` forwards errors to Lovable globals if those globals are present in the page environment.

Generated/model markdown script execution:

Model markdown cannot execute scripts in the current message renderer. The renderer does not parse markdown links or raw HTML; it splits fenced code blocks and renders all content as escaped React text. A model response containing `<script>alert(1)</script>` would display as text, not execute.

Security blockers:

- P0: no extension manifest/service worker/side-panel shell.
- P1: local-only endpoint is not enforced; user can configure a remote HTTP(S) endpoint and send prompts there.
- P1: Lovable error hooks should be removed or gated out of production extension builds. They are probably editor-only, but the extension should not include unused telemetry surfaces.
- P1: no extension CSP exists because no manifest exists.
- P2: chart CSS `dangerouslySetInnerHTML` is unused but should not ever receive untrusted chart config.

## Privacy / Network Audit

VERIFIED BY STATIC CODE INSPECTION:

Runtime network code in project source:

| Destination | Data sent | File | Required |
| --- | --- | --- | --- |
| `${settings.endpoint}/api/tags` | No prompt; model discovery request | `src/lib/ollama.ts:32` | Required for Ollama preflight |
| `${settings.endpoint}/api/chat` | Selected model, messages, stream flag, temperature | `src/lib/ollama.ts:86-101` | Required for chat |
| Lovable editor globals, if injected | Error object/context/message/stack/path, not prompts by normal code path | `src/lib/lovable-error-reporting.ts:26-56` | Not required for extension |

Expected local endpoints:

- `http://localhost:11434`
- `http://127.0.0.1:11434`

Actual code:

- Defaults to `http://localhost:11434`.
- Does not include `127.0.0.1` as a default/fallback.
- Does not validate that `settings.endpoint` is loopback.

LOCAL-ONLY AI DATA FLOW: FAIL

Why: the tested default path is local-only, and no cloud AI dependency was found, but the runtime does not enforce local-only endpoints. A user or stored setting can redirect prompt/response traffic to any URL accepted by `fetch`.

Cloud AI dependency detected: NO.

## Lovable / Supabase Cleanup Audit

VERIFIED BY STATIC CODE INSPECTION:

| Item | Classification | Evidence | Notes |
| --- | --- | --- | --- |
| `@lovable.dev/vite-tanstack-config` | REQUIRED for current web build; SHOULD REMOVE for extension | `package.json:73`, `vite.config.ts:7` | Current build depends on it, but it targets TanStack/Nitro web output, not MV3 extension output. |
| `.lovable/project.json` | UNUSED at runtime | `.lovable/project.json` | Lovable project metadata only. |
| `src/lib/lovable-error-reporting.ts` | SHOULD REMOVE; PRIVACY CONCERN | `src/lib/lovable-error-reporting.ts:26-56` | Uses Lovable globals when present. Not needed for local extension. |
| Default Lovable README | SHOULD REMOVE | `README.md` | Does not document extension install, Ollama setup, or Web Store packaging. |
| TanStack Start/Nitro/Cloudflare build target | SHOULD REMOVE for extension | `vite.config.ts:3-13`, `.output/nitro.json` after build | Produces Cloudflare web app artifacts, not extension artifacts. |
| Supabase client/auth/env | NONE FOUND | `rg supabase` | No Supabase runtime code found. |
| Generated shadcn/Radix UI components | UNUSED/PARTIAL | many files under `src/components/ui` | Many components are unused. Mostly bundle/maintenance issue, not security-critical. |
| Analytics/cloud database/remote functions | NONE FOUND in source | scoped `rg` scans | No project-owned backend detected. |

## Chrome Web Store Readiness

CHROME WEB STORE READINESS: 15%

Reasoning:

- Manifest V3: missing.
- Side panel: missing.
- Service worker: missing.
- Extension icons/name/version/description: missing from manifest.
- Host permissions: missing.
- CSP: missing.
- Remote code: no remote code found in source, but extension package does not exist.
- Privacy: local AI path is mostly real, but endpoint is not loopback-enforced and Lovable error hooks remain.
- Source maps: no `.map` files observed in `.output/public`, but this is not an extension package.
- Store permission justifications: impossible until manifest exists.
- Packaged function: cannot function after packaging because there is no package.

## Current Feature Matrix

| Feature                | Status               | Evidence | Blocking issue |
| ---------------------- | -------------------- | -------- | -------------- |
| Extension builds       | FAIL                 | `pnpm run build` emits `.output` Nitro/Cloudflare web app; no `manifest.json` | No MV3 build pipeline |
| Manifest V3            | FAIL                 | No source/build `manifest.json` | Manifest absent |
| Side Panel             | FAIL                 | No `side_panel`, `chrome.sidePanel`, or side-panel entrypoint | Extension shell absent |
| Ollama detection       | PASS                 | `src/lib/ollama.ts:27-45`; `/api/tags` execution succeeded | CORS vs daemon-down not distinguished |
| Real model discovery   | PASS                 | `/api/tags` returned real installed models | None for default local path |
| Gemma detection        | PASS                 | `src/lib/ollama.ts:67-78`; `gemma4:e4b` installed | Preflight always re-prefers Gemma over previous non-Gemma |
| Real Ollama chat       | PASS                 | `/api/chat` returned `LOCAL_AI_TEST_OK` | Chrome UI not extension-tested |
| Real streaming         | PASS                 | 8 readable chunks/8 NDJSON frames observed | Leftover non-newline buffer not parsed |
| Stop generation        | PASS                 | Abort test produced `AbortError`; `src/hooks/useLocalAI.ts:118-120` | Chrome UI not extension-tested |
| Multi-turn chat        | PASS                 | `src/hooks/useLocalAI.ts:164-173` sends bounded history plus system prompt | Not browser GUI-tested |
| IndexedDB history      | PARTIAL              | `src/lib/db.ts:15-24`, `129-158` | Not reload/restart tested; no corruption handling |
| Rename conversation    | PARTIAL              | `src/lib/db.ts:94-104`; UI in `ConversationList.tsx` | Not browser-click tested |
| Delete conversation    | PARTIAL              | `src/lib/db.ts:120-127`; UI in `ConversationList.tsx` | Not browser-click tested |
| Clear history          | PARTIAL              | `src/hooks/useLocalAI.ts:243-247`; `src/lib/db.ts:146-151` | Not browser-click tested |
| Export                 | PARTIAL              | `src/hooks/useLocalAI.ts:250-259`; `src/lib/db.ts:154-158` | Not browser-download tested |
| Settings persistence   | PARTIAL              | `src/lib/settings.ts:16-33` | Uses `localStorage`, not `chrome.storage.local`; not reload-tested |
| Local-only AI requests | FAIL                 | Endpoint is editable and unvalidated in `SettingsPanel.tsx:39` | Remote endpoint can receive prompts |
| Chrome CSP safe        | FAIL                 | No manifest/CSP exists | Extension package absent |
| Minimal permissions    | PARTIAL              | No broad permissions found | No required permissions declared either |
| Web Store ready        | FAIL                 | No MV3 package, icons, CSP, permissions, or side panel | Extension distribution work missing |

# FAKE, MOCKED, PLACEHOLDER, OR UI-ONLY FUNCTIONALITY

| Feature | File | Function/component | What UI implies | What actually happens | Required fix |
| --- | --- | --- | --- | --- | --- |
| Chrome extension side panel | N/A | N/A | Product appears intended as "local side panel" | No MV3 manifest, side-panel entry, action, or service worker exists | Add real extension manifest/build entries and package output |
| Help and architecture button | `src/routes/index.tsx:194-196` | `Index` | A help/architecture action exists | Button has no `onClick`; only title/aria label | Wire to a real help panel, remove it, or link to local docs |
| "Loopback only" endpoint control | `src/components/SettingsPanel.tsx:34-42` | `SettingsPanel` | Endpoint is restricted to loopback | Any string is accepted and later used by `fetch` | Validate/enforce localhost/127.0.0.1 or clearly label as advanced remote endpoint |
| Endpoint change behavior | `src/components/SettingsPanel.tsx:39`; `src/hooks/useLocalAI.ts:37-58` | `patchSettings` / `runPreflight` | Changing endpoint should affect discovered models/runtime state | Setting is saved, but preflight is not automatically rerun; old model list can remain | Trigger preflight on endpoint change or require explicit saved/retry state |
| Onboarding completion | `src/lib/settings.ts:13`; `src/hooks/useLocalAI.ts:48` | `runPreflight` | Persistent onboarding state exists | `onboardingComplete` is saved but no UI reads it | Use it for onboarding or remove it |
| Extension storage claim in architecture docs | documentation only | N/A | Settings should use `chrome.storage.local` | Actual code uses `localStorage` in `src/lib/settings.ts:17-30` | Switch to `chrome.storage.local` in extension context or update docs |
| No-model Gemma guidance | `src/components/RuntimePanel.tsx:75` | `RuntimePanel` | App is Gemma 4 E4B oriented | No-model instructions say `ollama pull gemma3:4b` | Update to `gemma4:e4b` or make recommendation dynamic |

No hard-coded AI responses, fake model lists, or simulated streaming behavior were found in the runtime source.

# P0 BLOCKERS

1. Missing Chrome extension shell.
   - Files affected: add `manifest.json`, side-panel HTML/entry, service worker/background script, extension-specific Vite build config.
   - Evidence: no manifest or Chrome API implementation found; `.output/public/manifest.json` is absent.
   - Impact: the intended prototype cannot be loaded as a Chrome extension.

2. No Chrome Side Panel implementation.
   - Files affected: new side-panel entry and service worker.
   - Evidence: no `side_panel` manifest property and no `chrome.sidePanel` source code.
   - Impact: toolbar cannot open the app in Chrome Side Panel.

3. No Ollama host permissions.
   - Files affected: `manifest.json`.
   - Evidence: no manifest; no `host_permissions`.
   - Impact: the extension cannot declare `http://localhost:11434/*` or `http://127.0.0.1:11434/*`.

# P1 BEFORE PUBLICATION

1. Enforce local-only endpoint policy.
   - Evidence: `SettingsPanel.tsx:39` accepts any endpoint; `ollama.ts:32` and `86` fetch the configured endpoint.
   - Risk: prompts/responses can leave the machine if endpoint is changed.

2. Replace web/Nitro/Lovable build with an extension build.
   - Evidence: `vite.config.ts:7-13`; `.output/nitro.json` reports `cloudflare-module`.
   - Risk: wrong artifacts and unnecessary server target.

3. Remove or gate Lovable error-reporting hooks from production extension.
   - Evidence: `src/lib/lovable-error-reporting.ts:26-56`.
   - Risk: unnecessary telemetry surface.

4. Fix lint/formatting.
   - Evidence: `pnpm run lint` failed with 6,375 problems.
   - Risk: CI/store release hygiene and future code review noise.

5. Add automated tests.
   - Evidence: no test scripts or test dependencies available.
   - Risk: streaming, abort, model selection, storage, and renderer regressions are easy to miss.

6. Harden stream parser leftover-buffer behavior.
   - Evidence: `src/lib/ollama.ts:116-151` does not parse a final non-newline-terminated frame.
   - Risk: malformed/truncated final output can be silently ignored.

7. Move settings to `chrome.storage.local` for extension context or document the choice.
   - Evidence: `src/lib/settings.ts:17-30` uses `localStorage`.
   - Risk: mismatch with extension architecture and documentation.

# P2 POST-MVP

1. Throttle/batch high-frequency streaming UI updates.
   - Evidence: `src/hooks/useLocalAI.ts:196-200` calls `setMessages` per chunk.
   - Benefit: smoother rendering for fast models.

2. Add IndexedDB schema validation/corruption recovery.
   - Evidence: `src/lib/db.ts` trusts stored records.
   - Benefit: safer recovery from bad local state.

3. Persist partial streaming output periodically.
   - Evidence: final assistant message is appended only at `src/hooks/useLocalAI.ts:228`.
   - Benefit: less data loss if side panel closes mid-generation.

4. Clean unused generated UI components.
   - Evidence: many shadcn/Radix components are present but unused.
   - Benefit: smaller maintenance surface.

5. Add better Ollama error classification.
   - Evidence: preflight collapses failures to `LOCAL_RUNTIME_UNREACHABLE`.
   - Benefit: clearer setup troubleshooting.

## Recommended Fix Order

1. Create the MV3 extension package.
   - Files likely affected: `manifest.json`, `src/extension/background.ts`, `src/sidepanel.tsx`, `sidepanel.html`, `vite.config.ts`.
   - Exact defect: no extension artifact exists.
   - Expected result: build output contains a valid MV3 `manifest.json`.
   - Verify: load unpacked build in Chrome and confirm manifest parses.

2. Wire Chrome Side Panel and toolbar action.
   - Files likely affected: `manifest.json`, background/service worker.
   - Exact defect: no `side_panel` or `chrome.sidePanel.setPanelBehavior`.
   - Expected result: clicking extension action opens the side panel.
   - Verify: clean Chrome profile, load unpacked, click toolbar action.

3. Add minimal permissions.
   - Files likely affected: `manifest.json`.
   - Exact defect: no host permissions for Ollama.
   - Expected result: permissions include only `sidePanel`, possibly `storage`, and host permissions for `http://localhost:11434/*` plus `http://127.0.0.1:11434/*`.
   - Verify: inspect final manifest and test `/api/tags` from side panel.

4. Adapt settings persistence for extension.
   - Files likely affected: `src/lib/settings.ts`, possibly a Chrome storage adapter.
   - Exact defect: settings use web `localStorage`, not `chrome.storage.local`.
   - Expected result: selected model/system prompt/temperature/history persist across extension reloads.
   - Verify: change settings, reload extension, confirm values.

5. Enforce local-only endpoint or make remote mode explicit.
   - Files likely affected: `src/lib/settings.ts`, `src/components/SettingsPanel.tsx`, `src/lib/ollama.ts`.
   - Exact defect: endpoint is unvalidated despite "Loopback only" UI.
   - Expected result: prompts can only go to localhost/127.0.0.1 unless an explicit advanced mode exists.
   - Verify: attempt to save `https://example.com`; confirm rejection or warning.

6. Preserve the real Ollama chat/streaming core.
   - Files likely affected: `src/lib/ollama.ts`, `src/hooks/useLocalAI.ts`.
   - Exact defect: core is good but needs extension integration and parser hardening.
   - Expected result: `/api/chat` streams into side panel and persists final response.
   - Verify: prompt `Reply with exactly: LOCAL_AI_TEST_OK` in side panel.

7. Add automated tests.
   - Files likely affected: test config, Ollama client tests, model-selection tests, renderer tests, storage tests.
   - Exact defect: no test harness exists.
   - Expected result: core behaviors are protected.
   - Verify: `test`, `typecheck`, `lint`, and `build` pass in CI.

8. Remove Lovable/cloud web leftovers.
   - Files likely affected: `package.json`, `vite.config.ts`, `.lovable/`, `src/lib/lovable-error-reporting.ts`, README.
   - Exact defect: current build and docs are web/Lovable-oriented.
   - Expected result: extension-focused project with no unnecessary telemetry hooks.
   - Verify: source scan for Lovable/Supabase/cloud remnants.

9. Security hardening.
   - Files likely affected: manifest CSP, message renderer, chart component, any future Chrome message handlers.
   - Exact defect: no extension CSP exists; local-only policy not enforced.
   - Expected result: model output remains inert; no broad permissions; no remote code.
   - Verify: static scan plus malicious model-output smoke test.

10. Package and Web Store preparation.
   - Files likely affected: icons, manifest metadata, README, privacy disclosure, release script.
   - Exact defect: no distributable extension package.
   - Expected result: reproducible zip/unpacked artifact.
   - Verify: clean-profile install and permission review.

```text
PROJECT AUDIT VERDICT

Working Chrome extension: NO
Build passes: YES
Manifest V3 valid: NO
Chrome Side Panel functional: NOT TESTED
Ollama connectivity implemented: YES
Ollama connectivity actually tested: YES
Gemma detected on this machine: YES
Real local inference tested: YES
Real streaming verified: YES
Stop generation verified: YES
Persistent history verified: PARTIAL
Cloud AI dependency detected: NO
Prompt/response leaves local machine: UNKNOWN
Critical security blocker: YES
Prototype usable today: PARTIAL
Ready for Chrome Web Store: NO

Overall completion estimate: 55%

Top 3 blockers:
1. No Manifest V3 extension package exists.
2. No Chrome Side Panel/action/service-worker implementation exists.
3. Local-only prompt flow is not enforced because the endpoint setting accepts arbitrary URLs.

Exact next action:
Create a minimal MV3 extension build wrapper around the existing React/Ollama core, including manifest.json, side_panel entry, service worker/action behavior, and localhost/127.0.0.1 Ollama host permissions.
```
