# Releasing

This project is currently preparing for a first Chrome Web Store submission. Do not publish automatically from the repository.

## Release candidate checks

From a clean working tree or an intentionally reviewed change set:

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

Inspect the ZIP:

```text
release/Local-AI-Side-Panel-0.1.1.zip
```

Its root must contain `manifest.json`, `sidepanel.html`, `service-worker.js`, `assets/`, and `icons/`. It must not contain a nested `dist/`, source files, `node_modules/`, or `.git/`.

## Manual release checks

Load the exact built `dist/` package in Chrome and verify Side Panel opening, Ollama detection, `gemma4:e4b`, real inference, streaming, Stop, second prompt after Stop, history actions, settings persistence, and recovery after restarting Ollama.

The existing [release checklist](RELEASE_CHECKLIST.md) is the source for the manual test list.

## Store submission preparation

Before submission:

- verify the finalized support and security contact details;
- create final screenshots showing actual features;
- create or verify the 440x280 promotional tile;
- review the privacy declaration against the exact submitted build;
- confirm the final Web Store extension ID and update the recommended scoped Ollama origin guidance if needed.

See the archived [Web Store listing draft](../archive/chrome-web-store/CHROME_WEB_STORE_LISTING.md), [privacy draft](../archive/chrome-web-store/CHROME_WEB_STORE_PRIVACY_DRAFT.md), and [asset plan](../archive/chrome-web-store/CHROME_WEB_STORE_ASSETS.md).
