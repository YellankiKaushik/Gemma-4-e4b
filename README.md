# Local AI Side Panel

Local AI Side Panel is a Chrome Manifest V3 extension for chatting with AI models that are already installed in Ollama on your computer. It opens in Chrome's Side Panel, discovers local models, streams responses, and keeps conversations on this device.

**Status:** v0.1.1 release candidate
**Recommended model:** `gemma4:e4b`
**License:** [Apache License 2.0](LICENSE)

## Why this project exists

Local AI Side Panel is intentionally small and local-first. It gives a browser-native interface to a local Ollama runtime without an account, cloud inference service, API key, analytics SDK, or webpage access.

```text
Chrome Side Panel
        |
        v
http://localhost:11434 or http://127.0.0.1:11434
        |
        v
Ollama -> locally installed model
```

The extension does not install Ollama or bundle models. Ollama and the selected model remain separate software installed and controlled by the user.

## Features

- Chrome Side Panel chat interface
- Actual Ollama model discovery through `/api/tags`
- Streaming chat responses through `/api/chat`
- Stop generation with request cancellation
- Multiple conversations with rename, delete, clear-history, and export actions
- IndexedDB conversation history
- `chrome.storage.local` settings persistence
- Model selection, system prompt, temperature, and history-depth controls
- Auto, Light, and Dark themes
- Loopback-only endpoint validation

## Quick start

The Chrome Web Store listing is not published yet. Use the local unpacked installation below or download a ZIP from a future GitHub Release when one is available.

### 1. Install Ollama and a model

Install Ollama from [ollama.com](https://ollama.com/download), start it, and pull at least one model. The recommended starting point is:

```sh
ollama pull gemma4:e4b
```

See [Ollama setup](docs/OLLAMA_SETUP.md) for platform-specific environment configuration.

### 2. Build the extension

Requires Node.js and pnpm.

```sh
pnpm install
pnpm run build
```

### 3. Load it in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository's `dist/` directory.
5. Click the extension action to open the Side Panel.

The full installation flow, including Ollama origin setup, is in [Installation](docs/INSTALLATION.md).

### 4. Configure the Ollama origin if needed

If the first request shows HTTP 403, open the extension's runtime setup area and copy the exact `chrome-extension://...` origin shown there. Add that origin to `OLLAMA_ORIGINS`, then restart Ollama completely. The extension derives its current ID from `chrome.runtime.id`; it does not assume that an unpacked ID will match a future Web Store ID.

For development only, Ollama also supports the broader pattern `chrome-extension://*`. It is less restrictive because it allows other Chrome extensions to connect to Ollama. Prefer the exact origin for a release installation.

## Documentation

- [Installation](docs/INSTALLATION.md): build, load, update, and first-run steps
- [Ollama setup](docs/OLLAMA_SETUP.md): local runtime, model, origin, and platform guidance
- [Troubleshooting](docs/TROUBLESHOOTING.md): common failures and recovery steps
- [FAQ](docs/FAQ.md): short answers to common usage and privacy questions
- [Architecture](docs/ARCHITECTURE.md): extension boundaries and data flow
- [Development](docs/DEVELOPMENT.md): local workflow, tests, and debugging
- [Releasing](docs/RELEASING.md): release candidate and package workflow
- [Final release QA](docs/FINAL_RELEASE_QA.md): test the exact generated ZIP before submission
- [GitHub Release](docs/GITHUB_RELEASE.md): manual GitHub Release handoff steps
- [Chrome Web Store submission](docs/CHROME_WEB_STORE_SUBMISSION.md): manual store submission checklist
- [Branding](docs/BRANDING.md): approved v0.1.0 icon assets and remaining store-asset plan
- [Store screenshots](docs/STORE_SCREENSHOTS.md): screenshot plan for listing assets
- [Contributing](CONTRIBUTING.md): how to propose changes
- [Security](SECURITY.md): vulnerability reporting and security scope
- [Privacy policy](PRIVACY_POLICY.md): data handling statement
- [Support](SUPPORT.md): support entry point

## Development

```sh
pnpm install
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify:extension
pnpm run package
```

`pnpm run package` rebuilds the extension, verifies the production manifest, and creates a ZIP with the extension files at its root. It does not publish anything.

The development server is useful for ordinary browser/component work, but Chrome extension verification should use the built `dist/` directory. See [Development](docs/DEVELOPMENT.md) for the distinction.

## Releases

Release packages are generated locally with `pnpm run package`. The v0.1.1 release candidate package is `Local-AI-Side-Panel-0.1.1.zip`.

Do not create or force-update the `v0.1.1` tag without checking existing tags first. See [Git release tagging](docs/GIT_RELEASE_TAGGING.md) and [GitHub Release](docs/GITHUB_RELEASE.md).

## Privacy and permissions

The production extension uses exactly two Chrome permissions: `sidePanel` and `storage`. It requests only these Ollama host permissions:

- `http://localhost:11434/*`
- `http://127.0.0.1:11434/*`

Prompts and model responses go to the user's local Ollama process. Conversations are stored in IndexedDB, and settings are stored in `chrome.storage.local`. No project-controlled cloud backend, account system, analytics, advertising SDK, or remote inference provider is part of the runtime.

Read the [privacy policy](PRIVACY_POLICY.md) before distributing a build. The public support contact is kaushikyellanki@gmail.com.

## Troubleshooting at a glance

- **Ollama unavailable:** start Ollama, confirm `/api/tags` is reachable, then use Retry in the extension.
- **No models:** run `ollama list` and install `gemma4:e4b` or another compatible local model.
- **HTTP 403:** allow the exact extension origin in `OLLAMA_ORIGINS` and restart Ollama.
- **HTTP 500:** treat it as a local model/runtime failure; inspect Ollama logs.
- **CUDA initialization failure:** only for systems that reproduce the issue, try the documented `GGML_CUDA_PDL=0` workaround.

See [Troubleshooting](docs/TROUBLESHOOTING.md) for detailed steps.

## Attribution

Local AI Side Panel is an independent project and is not affiliated with or endorsed by Ollama, Google, Chrome, or the developers of individual supported models. Product names and trademarks belong to their respective owners.

## License

This project is distributed under the [Apache License 2.0](LICENSE). Third-party software, Ollama, and local AI models remain subject to their own licenses and terms.
