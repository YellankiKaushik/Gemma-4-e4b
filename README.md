# Gemma Local AI

Gemma Local AI is a Chrome Manifest V3 side-panel extension for chatting with local Ollama-compatible models. The recommended default model is `gemma4:e4b`, and the extension discovers installed Ollama models through the local `/api/tags` endpoint.

The intended data flow is local:

```text
Chrome extension
  -> http://localhost:11434 or http://127.0.0.1:11434
  -> Ollama
  -> local model
```

There is no project cloud inference backend, login system, Supabase dependency, analytics pipeline, or remote AI provider in the extension runtime.

## Prerequisites

- Google Chrome 116 or newer
- Ollama installed and running
- A local chat model installed in Ollama
- Recommended model:

```sh
ollama pull gemma4:e4b
```

## Install Dependencies

```sh
pnpm install
```

## Build

```sh
pnpm run build
```

The unpacked extension is emitted to `dist/`.

## Development Installation In Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this repository's `dist/` directory.
5. Click the Gemma Local AI toolbar action to open the side panel.

The current development unpacked extension ID observed during QA is:

```text
iggagallhogkbgjndelifkdpfjbkahck
```

Do not assume this is the final Chrome Web Store ID. Chrome can assign a different ID depending on packaging, signing, and store publication.

## Release Package

```sh
pnpm run package
```

This command builds the extension, verifies the MV3 package structure, and creates:

```text
release/Gemma-Local-AI-0.1.0.zip
```

The ZIP root contains `manifest.json`, `sidepanel.html`, `service-worker.js`, `assets/`, and `icons/`. It does not nest those files under `dist/`.

## Verification

```sh
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify:extension
pnpm run package
```

Optional direct Ollama checks:

```sh
curl http://localhost:11434/api/tags
curl http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"gemma4:e4b","messages":[{"role":"user","content":"Reply with exactly: LOCAL_AI_TEST_OK"}],"stream":false}'
```

## Ollama Origin Setup

Chrome extension pages have a `chrome-extension://...` origin. If Ollama rejects that origin, restart Ollama with an allowed origin.

Development option:

```sh
OLLAMA_ORIGINS=chrome-extension://* ollama serve
```

More restrictive production-style option once the extension ID is known:

```sh
OLLAMA_ORIGINS=chrome-extension://<EXTENSION_ID> ollama serve
```

If you are using the current unpacked development ID from the QA run, the scoped value is:

```sh
OLLAMA_ORIGINS=chrome-extension://iggagallhogkbgjndelifkdpfjbkahck ollama serve
```

Fully restart Ollama after changing environment variables. The extension does not modify operating-system environment variables for you.

## CUDA Troubleshooting

On one Windows machine with an RTX 4050, Ollama/GGML failed with a local CUDA runtime error similar to:

```text
CUDA error: shared object initialization failed
ggml_cuda_kernel_can_use_pdl
```

The observed workaround was to persist:

```sh
GGML_CUDA_PDL=0
```

Only set this if your local Ollama runtime needs it. This is an Ollama/GGML runtime workaround, not a Chrome extension setting, and the extension does not change it automatically.

## Privacy

Prompts and responses are sent only to the configured loopback Ollama endpoint. The extension accepts only:

- `http://localhost:<port>`
- `http://127.0.0.1:<port>`

Conversation history is stored in IndexedDB. Settings are stored in `chrome.storage.local` when running as an extension, with a localStorage fallback only for normal browser development.

## Troubleshooting

Ollama unavailable:

- Confirm Ollama is running.
- Confirm the endpoint is `http://localhost:11434` or `http://127.0.0.1:11434`.
- Re-run preflight from the side panel after restarting Ollama.

No model found:

- Run `ollama list`.
- Install the recommended model with `ollama pull gemma4:e4b`.
- Re-run preflight after the pull completes.

403 origin error:

- Ollama rejected the Chrome extension origin.
- Set `OLLAMA_ORIGINS` to `chrome-extension://*` for development, or to `chrome-extension://<EXTENSION_ID>` once the ID is stable.
- Fully restart Ollama.

500 local model runtime error:

- The local Ollama/model runtime failed.
- Restart Ollama and try again.
- If you see the Windows RTX 4050 CUDA failure above, try `GGML_CUDA_PDL=0`.

Extension reload:

- Rebuild with `pnpm run build`.
- Open `chrome://extensions`.
- Click the reload button for Gemma Local AI.
- Reopen the side panel and run preflight if needed.

Model missing:

- The selected model may have been removed from Ollama.
- Pull `gemma4:e4b` again or pick another discovered model in Settings.
