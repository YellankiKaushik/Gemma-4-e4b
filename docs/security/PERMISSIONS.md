# Permissions

Local AI Side Panel is intentionally narrow. The production manifest uses exactly these Chrome permissions:

```json
["sidePanel", "storage"]
```

It uses exactly these host permissions:

```json
["http://localhost:11434/*", "http://127.0.0.1:11434/*"]
```

## Permission Rationale

`sidePanel` is required to display the extension interface in Chrome's Side Panel.

`storage` is required for user settings stored in `chrome.storage.local`.

The two host permissions allow direct requests to Ollama on the local machine. They do not allow requests to remote hosts, LAN addresses, arbitrary websites, or HTTPS endpoints.

## Permissions Not Requested

The extension does not request:

- `tabs`
- `activeTab`
- `scripting`
- `webRequest`
- `cookies`
- `history`
- broad host permissions such as `<all_urls>`
- content scripts

## Runtime Data Boundary

Prompts and responses are sent to the user's local Ollama runtime. Conversations are stored in IndexedDB in the user's Chrome profile. Settings are stored in `chrome.storage.local`.

There is no project-controlled cloud backend, analytics SDK, advertising SDK, account system, remote inference provider, or webpage-reading component.

See the [privacy policy](../../PRIVACY_POLICY.md) and [security policy](../../SECURITY.md) for the public policy statements.
