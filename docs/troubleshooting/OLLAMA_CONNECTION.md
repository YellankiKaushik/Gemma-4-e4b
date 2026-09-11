# Ollama Connection Troubleshooting

Use this guide when the Side Panel cannot reach Ollama, cannot list models, or cannot stream a response.

## Quick Checks

1. Start Ollama.
2. Confirm the local API responds:

```sh
curl http://localhost:11434/api/tags
```

3. Confirm at least one model is installed:

```sh
ollama list
```

4. Reload the extension and click Retry.

## Ollama Unavailable

If the extension says Ollama is unavailable, the local server is not reachable at the configured loopback endpoint.

Check that Ollama is running and that the endpoint is exactly one of these forms:

- `http://localhost:11434`
- `http://127.0.0.1:11434`

Paths, query strings, credentials, fragments, HTTPS URLs, LAN addresses, and remote hosts are rejected by the extension.

## HTTP 403

HTTP 403 usually means Ollama rejected the Chrome extension origin.

Open the extension runtime setup area and copy the exact origin shown there:

```text
chrome-extension://YOUR_CURRENT_EXTENSION_ID
```

Set `OLLAMA_ORIGINS` to that exact origin, fully restart Ollama, reload the extension, and click Retry.

For development only, the broader pattern below can be used:

```text
chrome-extension://*
```

The wildcard is convenient for changing unpacked IDs, but it allows any Chrome extension origin to reach Ollama. Prefer the exact origin for a release installation.

## Windows Origin Setup

Use the command shown by the extension, or adapt this example:

```powershell
[Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS","chrome-extension://YOUR_CURRENT_EXTENSION_ID","User")
```

Then quit Ollama completely from the system tray or Task Manager and start it again.

## macOS Origin Setup

When Ollama runs as an app, set the variable with `launchctl` before restarting Ollama:

```sh
launchctl setenv OLLAMA_ORIGINS "chrome-extension://YOUR_CURRENT_EXTENSION_ID"
```

## Linux Origin Setup

When Ollama runs as a systemd service, add this to the service override:

```ini
[Service]
Environment="OLLAMA_ORIGINS=chrome-extension://YOUR_CURRENT_EXTENSION_ID"
```

Then run:

```sh
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

## Empty Model List

Install a model and retry:

```sh
ollama pull gemma4:e4b
```

The extension only shows models returned by Ollama.

## HTTP 500

HTTP 500 is a local Ollama or model runtime failure. Try a smaller model, inspect Ollama logs, and confirm the same prompt works from the Ollama CLI.

## CUDA Initialization Failure

Only use this workaround if the local Ollama logs show the specific CUDA shared-object initialization failure:

```text
GGML_CUDA_PDL=0
```

Set it in the same environment where Ollama starts, then restart Ollama completely.

## Official References

- [Ollama download](https://ollama.com/download)
- [Ollama FAQ](https://docs.ollama.com/faq)
- [Ollama Windows documentation](https://docs.ollama.com/windows)
- [Ollama macOS documentation](https://docs.ollama.com/macos)
- [Ollama Linux documentation](https://docs.ollama.com/linux)
