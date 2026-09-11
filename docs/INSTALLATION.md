# Installation

## Prerequisites

- Google Chrome 116 or newer
- Node.js and pnpm for building from source
- Ollama installed and running locally
- At least one compatible Ollama model

The recommended model is `gemma4:e4b`.

## Build from source

From the repository root:

```sh
pnpm install
pnpm run build
```

The build creates a loadable extension in `dist/`.

## Load unpacked in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Select the repository's `dist/` directory.
5. Pin the extension if desired, then click its action to open Chrome's Side Panel.

The extension action is configured to open the Side Panel. No development server is required for the built extension.

## First launch

1. Make sure Ollama is running.
2. Confirm `gemma4:e4b` is installed, or install another compatible model.
3. Open the Side Panel.
4. Wait for model discovery to finish.
5. If Ollama reports HTTP 403, follow [Ollama origin setup](OLLAMA_SETUP.md#allow-the-chrome-extension-origin).

## Updating an unpacked build

Run `pnpm run build`, return to `chrome://extensions`, and click the extension's reload button. Existing IndexedDB conversations and `chrome.storage.local` settings are preserved.

## Release ZIP

To build the verified package:

```sh
pnpm run package
```

The output is `release/Local-AI-Side-Panel-0.1.1.zip`. Its root contains `manifest.json`, `sidepanel.html`, `service-worker.js`, `assets/`, and `icons/`.

## Web Store status

The project is not published to the Chrome Web Store yet. The source repository and future GitHub Releases are the distribution paths until a listing is published.
