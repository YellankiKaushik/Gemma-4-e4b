# Gemma Local AI

Gemma Local AI is a Chrome Manifest V3 side-panel extension for chatting with locally running Ollama models. It is optimized for `gemma4:e4b`, but it discovers and can use any compatible model installed in Ollama.

The intended data flow is local:

```text
Chrome extension
  -> http://localhost:11434
  -> Ollama
  -> local model
```

There is no cloud inference backend, account system, Supabase dependency, or analytics pipeline in the extension runtime.

## Prerequisites

- Chrome 116 or newer
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

The extension is emitted to `dist/`.

## Development Installation In Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this repository's `dist/` directory.
5. Click the Gemma Local AI toolbar action to open the side panel.

## Ollama Setup

Start Ollama:

```sh
ollama serve
```

If Chrome blocks the extension origin, restart Ollama with an allowed origin for development:

```sh
OLLAMA_ORIGINS=chrome-extension://* ollama serve
```

For a published extension, prefer scoping `OLLAMA_ORIGINS` to the exact published extension origin instead of allowing every Chrome extension.

## Verification

```sh
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

Optional direct Ollama checks:

```sh
curl http://localhost:11434/api/tags
curl http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"gemma4:e4b","messages":[{"role":"user","content":"Reply with exactly: LOCAL_AI_TEST_OK"}],"stream":false}'
```

## Privacy

Prompts and responses are sent only to the configured local loopback Ollama endpoint. The extension accepts only:

- `http://localhost:<port>`
- `http://127.0.0.1:<port>`

Conversation history is stored in IndexedDB. Settings are stored in `chrome.storage.local`.

## Troubleshooting

Ollama not detected:

- Confirm `ollama serve` is running.
- Confirm the endpoint is `http://localhost:11434` or `http://127.0.0.1:11434`.
- Check whether `OLLAMA_ORIGINS` needs the Chrome extension origin.

Model missing:

- Run `ollama list`.
- Install the recommended model with `ollama pull gemma4:e4b`.

Origin blocked:

- Restart Ollama with a development origin allow-list, or scope it to the exact extension ID once known.

Generation errors:

- Confirm the selected model still appears in `ollama list`.
- Try a shorter conversation if the model reports a context limit.
- Use Stop to abort a long generation, then send a new prompt.
