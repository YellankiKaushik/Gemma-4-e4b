# FAQ

## Is this a cloud AI client?

No. The extension sends prompts to Ollama on the user's own computer through the allowed loopback endpoints. It has no project cloud inference backend.

## Does the extension include a model?

No. Ollama and models are installed separately. `gemma4:e4b` is the recommended model, not a bundled dependency.

## Where are conversations stored?

Conversation and message records are stored in IndexedDB inside the user's Chrome profile. The extension's clear-history and export actions operate on that local data.

## Where are settings stored?

Settings such as the selected model, endpoint, system prompt, temperature, history depth, and theme are stored in `chrome.storage.local`.

## Can I use a remote Ollama server?

No. This release intentionally accepts only `http://localhost:<port>` and `http://127.0.0.1:<port>` endpoints.

## Why does Ollama return 403?

Ollama may not allow the extension's `chrome-extension://...` origin until it is added to `OLLAMA_ORIGINS`. Copy the exact origin from the extension's runtime setup area and restart Ollama after changing it.

## Does the extension read webpage content?

No. It does not request `tabs`, `activeTab`, `scripting`, content scripts, or broad page host permissions.

## Why does the unpacked extension ID change?

Chrome can assign an unpacked extension a development ID that is different from a future Web Store ID. The extension reads `chrome.runtime.id` at runtime and shows the current origin in setup guidance.

## Is the current icon final branding?

The packaged icon is a functional placeholder. See [Store assets](CHROME_WEB_STORE_ASSETS.md) for the independent branding task that remains before publication.
