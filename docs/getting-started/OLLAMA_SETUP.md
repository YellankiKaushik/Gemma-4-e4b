# Ollama Setup

Local AI Side Panel connects directly to an Ollama server running on the same computer. It does not install Ollama, download models, or change Ollama configuration automatically.

## Install and start Ollama

Install Ollama from [ollama.com](https://ollama.com/download). Start the Ollama application or run:

```sh
ollama serve
```

Confirm the local API responds:

```sh
curl http://localhost:11434/api/tags
```

The extension uses only these loopback endpoints:

- `http://localhost:11434/*`
- `http://127.0.0.1:11434/*`

## Install a model

The recommended model for this project is:

```sh
ollama pull gemma4:e4b
```

Any compatible model returned by `ollama list` can be selected in the extension. The extension does not fake a model when Ollama reports an empty list.

## Allow the Chrome extension origin

Ollama accepts some local origins by default. Chrome extension pages use a `chrome-extension://` origin, so the origin may need to be added to `OLLAMA_ORIGINS`.

Open the extension's runtime setup area and copy the exact origin displayed there. It is derived from `chrome.runtime.id` and has this shape:

```text
chrome-extension://YOUR_CURRENT_EXTENSION_ID
```

Use the exact origin for a release installation. For local development, Ollama's broader pattern can be used:

```text
chrome-extension://*
```

The wildcard is less restrictive because it allows other Chrome extensions to connect to Ollama.

After changing `OLLAMA_ORIGINS`, quit and restart Ollama completely. Reload the extension and click Retry.

## Windows

Run the copyable command shown by the extension, or adapt this example with the current origin:

```powershell
[Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS","chrome-extension://YOUR_CURRENT_EXTENSION_ID","User")
```

Ollama reads user environment variables when it starts. Close the Ollama application fully before starting it again.

## macOS

When Ollama runs as a macOS application, environment variables can be set with `launchctl` before restarting the application:

```sh
launchctl setenv OLLAMA_ORIGINS "chrome-extension://YOUR_CURRENT_EXTENSION_ID"
```

See the [official Ollama FAQ](https://docs.ollama.com/faq) for current macOS environment-variable guidance.

## Linux

When Ollama runs as a systemd service, edit the service and add an environment line under `[Service]`:

```ini
[Service]
Environment="OLLAMA_ORIGINS=chrome-extension://YOUR_CURRENT_EXTENSION_ID"
```

Then reload and restart the service:

```sh
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

See the [official Ollama FAQ](https://docs.ollama.com/faq) for current systemd guidance.

## Optional CUDA troubleshooting

Do not set this unless Ollama reproduces the specific CUDA shared-object initialization failure:

```text
GGML_CUDA_PDL=0
```

This is a local Ollama/GGML runtime workaround. The extension does not set it or require it.

## Official references

- [Ollama quickstart](https://docs.ollama.com/quickstart)
- [Ollama FAQ](https://docs.ollama.com/faq)
- [Ollama Windows documentation](https://docs.ollama.com/windows)
- [Ollama macOS documentation](https://docs.ollama.com/macos)
- [Ollama Linux documentation](https://docs.ollama.com/linux)
