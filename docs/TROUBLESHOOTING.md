# Troubleshooting

## Ollama is unavailable

1. Start Ollama or run `ollama serve`.
2. Open `http://localhost:11434/api/tags` in a browser or query it with `curl`.
3. Confirm the endpoint in Settings remains a loopback URL.
4. Click Retry in the extension.

If the API works in a normal browser request but not in the extension, continue with the origin section below.

## No models are found

Run:

```sh
ollama list
ollama pull gemma4:e4b
```

Click Retry after the pull completes. The extension only displays models returned by Ollama.

## HTTP 403 or extension origin rejected

Ollama is refusing the Chrome extension origin. Open the runtime setup area and copy the exact current origin, for example:

```text
chrome-extension://YOUR_CURRENT_EXTENSION_ID
```

Add it to `OLLAMA_ORIGINS`, restart Ollama completely, reload the extension, and click Retry. On Windows, the extension provides a copyable PowerShell command.

For development only, `chrome-extension://*` is a broader fallback. Prefer the exact origin for a release installation.

## HTTP 500 or model runtime failure

HTTP 500 generally means the local Ollama process or model runtime failed. Restart Ollama and retry. Check Ollama's own logs for model loading, memory, driver, or GPU errors. The extension cannot repair a local model runtime failure.

## CUDA shared-object initialization failure

If the local runtime reports an error containing `ggml_cuda_kernel_can_use_pdl`, users who reproduce that issue can try:

```text
GGML_CUDA_PDL=0
```

This is optional, runtime-specific troubleshooting. The extension never changes environment variables automatically.

## A selected model disappeared

Install the model again or select another model returned by Ollama. The extension falls back to an available model instead of retrying a missing model forever.

## History or settings look stale

Reload the extension from `chrome://extensions`. Do not clear site data unless you intend to remove local state. Conversations are in IndexedDB; settings are in `chrome.storage.local`.

## Reset local state

- Reload the extension for a normal code update.
- Use the extension's clear-history action to remove conversations.
- Reinstall the extension only when Chrome reports a package or installation problem.

## Still stuck?

Record the operating system, Chrome version, Ollama version, model name, exact UI error, and the command used. Do not include prompts, private conversations, or full logs in a public issue.

Open a [bug report](https://github.com/YellankiKaushik/Gemma-4-e4b/issues/new?template=bug_report.yml) after checking the [FAQ](FAQ.md) and [Ollama setup guide](OLLAMA_SETUP.md).
