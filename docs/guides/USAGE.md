# Usage

Local AI Side Panel opens as a Chrome Side Panel and connects to Ollama on the same computer. It is designed for local chat, not webpage automation or cloud AI access.

## Open The Panel

Click the extension action in Chrome. The background service worker is configured to open the Side Panel directly.

The extension performs a runtime preflight when it starts:

1. It validates the configured endpoint.
2. It asks Ollama for installed models through `/api/tags`.
3. It selects a saved model when still available, otherwise it prefers `gemma4:e4b` when installed.
4. It shows a setup or error state when Ollama is unavailable or rejects the extension origin.

## Start A Chat

Choose an installed model, type a message, and submit. Responses stream from Ollama as they are generated. The assistant message is updated incrementally and stored after completion.

Use **Stop** to cancel an active response. Partial text already received remains visible and can be kept as part of the conversation.

## Manage Conversations

The sidebar supports multiple local conversations. Use it to switch, rename, delete, clear history, or export conversations.

Conversation data stays in IndexedDB inside the current Chrome profile. Removing the extension or clearing site data from Chrome can remove this local data.

## Configure Settings

Settings are stored with `chrome.storage.local` and include:

- Ollama endpoint
- Selected model
- System prompt
- Temperature
- History depth
- Theme

The endpoint must remain a loopback HTTP URL using `localhost` or `127.0.0.1`. Remote hosts, LAN hosts, HTTPS URLs, paths, query strings, credentials, and fragments are rejected by design.

## Themes

The app supports Auto, Light, and Dark. Auto follows the system preference. Reduced-motion preferences are respected by the UI where motion is used.

## Export

Use export from the conversation controls when you need a local copy of a conversation. Exported files are created by the browser from local IndexedDB content; no project server receives them.
