# Support

## Ollama Not Detected

- Confirm Ollama is installed and running.
- Confirm the endpoint is `http://localhost:11434` or `http://127.0.0.1:11434`.
- Restart Ollama, reopen the side panel, and click Retry.

## No Models Found

- Run `ollama list`.
- Install a compatible model.
- Recommended: `ollama pull gemma4:e4b`.
- Click Retry after the model is installed.

## Extension Origin Rejected / HTTP 403

Ollama may reject Chrome extension origins unless they are allowed with `OLLAMA_ORIGINS`.

Open the extension Settings or runtime setup panel and copy the exact current extension origin:

```text
chrome-extension://YOUR_CURRENT_EXTENSION_ID
```

Set `OLLAMA_ORIGINS` to that exact origin, then restart Ollama completely.

Windows PowerShell example:

```powershell
[Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS","chrome-extension://YOUR_CURRENT_EXTENSION_ID","User")
```

Development-only wildcard option:

```text
chrome-extension://*
```

The wildcard is less restrictive because it allows other Chrome extensions to contact Ollama.

## Ollama HTTP 500

HTTP 500 usually means the local Ollama/model runtime failed. Restart Ollama and check Ollama logs for model or GPU runtime errors. This is not usually caused by the Chrome extension itself.

## CUDA Shared Object Initialization Error

Some systems may show a local Ollama/GGML CUDA error similar to:

```text
CUDA error: shared object initialization failed
ggml_cuda_kernel_can_use_pdl
```

Optional workaround for users who reproduce that specific error:

```text
GGML_CUDA_PDL=0
```

Do not set this unless your local Ollama runtime needs it.

## Reset Extension

- Rebuild with `pnpm run build` if running an unpacked development build.
- Open `chrome://extensions`.
- Click reload for Local AI Side Panel.
- Clear local history from Settings if desired.
- Reinstall the extension if Chrome reports package corruption.

## Privacy

See `PRIVACY_POLICY.md`.
