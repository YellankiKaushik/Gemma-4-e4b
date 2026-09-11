# Web Store Permission Justifications

Use this copy when completing Chrome Web Store permission justifications.

## `sidePanel`

"Required to display the local AI chat interface alongside webpages in Chrome's Side Panel."

## `storage`

"Required to persist user settings such as theme, selected model, system prompt, temperature, and history preferences."

## `http://localhost:11434/*`

"Required to communicate with the user's locally running Ollama API on localhost."

## `http://127.0.0.1:11434/*`

"Required to communicate with the user's locally running Ollama API through the IPv4 loopback address."

## Scope Notes

- No broad web access.
- No `<all_urls>`.
- No page content access.
- No content scripts.
- No remote cloud inference.
- No analytics or advertising SDK.
