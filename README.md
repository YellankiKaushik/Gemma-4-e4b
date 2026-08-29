# Local AI Side Panel

Local AI Side Panel is a Chrome Manifest V3 extension that puts a local AI chat client in Chrome's Side Panel. It connects directly to Ollama running on your computer and works with locally installed Ollama models, including Gemma.

The default recommended model is `gemma4:e4b`, but the extension discovers the models actually installed in Ollama and lets you choose among them.

```text
Chrome extension
  -> loopback Ollama API
  -> local model
```

There is no project cloud inference backend, account system, Supabase dependency, analytics pipeline, or remote AI provider in the extension runtime.

## Installation

1. Build the extension with `pnpm run build`.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select this repository's `dist/` directory.
6. Click the Local AI Side Panel toolbar action to open the side panel.

## Build

Install dependencies:

```sh
pnpm install
```

Run checks:

```sh
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify:extension
```

## Ollama Setup

Install and start Ollama, then install at least one compatible local model.

Recommended:

```sh
ollama pull gemma4:e4b
```

Start Ollama:

```sh
ollama serve
```

The extension can use only loopback endpoints:

- `http://localhost:<port>`
- `http://127.0.0.1:<port>`

The default endpoint is:

```text
http://localhost:11434
```

## Extension-Origin Setup

Chrome extension pages use a `chrome-extension://...` origin. If Ollama rejects the extension with HTTP 403, open Settings or the runtime setup panel and copy the exact extension origin shown there.

Production-style scoped value:

```text
OLLAMA_ORIGINS=chrome-extension://<YOUR_CURRENT_EXTENSION_ID>
```

Windows PowerShell example:

```powershell
[Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS","chrome-extension://<YOUR_CURRENT_EXTENSION_ID>","User")
```

Fully restart Ollama after changing environment variables.

Development/troubleshooting wildcard:

```sh
OLLAMA_ORIGINS=chrome-extension://* ollama serve
```

The wildcard allows other Chrome extensions to contact Ollama, so prefer the exact current extension origin when possible.

## Privacy

Prompts and responses are sent only to the configured loopback Ollama endpoint. Conversation history is stored in IndexedDB inside your Chrome profile. Settings, including theme, selected model, system prompt, temperature, and history depth, are stored in `chrome.storage.local`.

See `PRIVACY_POLICY.md` for the full privacy policy draft.

## Troubleshooting

Ollama unavailable:

- Confirm Ollama is running.
- Confirm the endpoint is `http://localhost:11434` or `http://127.0.0.1:11434`.
- Re-run preflight from the side panel after restarting Ollama.

No model found:

- Run `ollama list`.
- Install the recommended model with `ollama pull gemma4:e4b`.
- Re-run preflight after the pull completes.

HTTP 403 / extension origin rejected:

- Copy the extension origin from Settings or the setup panel.
- Add that origin to `OLLAMA_ORIGINS`.
- Fully restart Ollama.

HTTP 500 / local runtime error:

- The local Ollama/model runtime failed.
- Restart Ollama and try again.
- Check Ollama logs for model or GPU runtime details.

CUDA shared object initialization error:

- Some systems may need the Ollama/GGML runtime workaround `GGML_CUDA_PDL=0`.
- Set it only if you reproduce that specific local CUDA failure.
- The extension does not set or require this environment variable.

## Development

The extension is a plain Vite + React + TypeScript MV3 project. The side panel renders from `sidepanel.html`, and the service worker configures the toolbar action to open the side panel.

Do not add content scripts, `activeTab`, broad host permissions, remote inference, analytics, or cloud sync for the v0.1 MVP.

## Release Packaging

Create the Chrome Web Store ZIP:

```sh
pnpm run package
```

Expected output:

```text
release/Local-AI-Side-Panel-0.1.0.zip
```

The ZIP root contains:

```text
manifest.json
sidepanel.html
service-worker.js
assets/
icons/
```

## Third-Party Attribution

Local AI Side Panel is an independent project and is not affiliated with or endorsed by Ollama, Google, or the developers of individual supported models. Product names and trademarks belong to their respective owners.
