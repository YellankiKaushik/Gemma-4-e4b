# Production Extension ID QA

The Chrome Web Store production extension ID may differ from local unpacked development IDs.

The extension uses:

```text
chrome.runtime.id
```

The 403 setup UI should dynamically show:

```text
chrome-extension://<CURRENT_INSTALLED_ID>
```

No production runtime UI should hard-code a local development extension ID.

## Final Production Test

1. Install the production or store build.
2. Open Runtime or trigger the 403 setup state.
3. Copy the displayed extension origin.
4. Verify the displayed ID equals Chrome's installed extension ID.
5. Copy the Windows command.
6. Verify the exact origin is embedded.
7. Configure `OLLAMA_ORIGINS` manually.
8. Fully restart Ollama.
9. Retry from the extension.
10. Verify inference works.

For development troubleshooting only, `chrome-extension://*` may be used with Ollama, but it is less restrictive because it allows other Chrome extensions to contact Ollama.
