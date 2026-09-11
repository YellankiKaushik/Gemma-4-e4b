# Models

Local AI Side Panel lists models installed in Ollama. It does not bundle models and does not download models automatically.

## Recommended Model

The recommended starting model is:

```sh
ollama pull gemma4:e4b
```

After installation, confirm Ollama sees it:

```sh
ollama list
```

Reload the Side Panel or click Retry if model discovery had already failed.

## Model Discovery

The extension calls Ollama's local `/api/tags` endpoint and displays models returned by the runtime. If the list is empty, install a model with Ollama first.

When the saved selected model is no longer installed, the extension selects a valid installed model. It prefers `gemma4:e4b` when available.

## Choosing A Model

Smaller models usually respond faster and use less memory. Larger models may produce better answers but can require more RAM, VRAM, and startup time.

Model performance, hardware acceleration, and runtime errors are controlled by Ollama and the local machine. The extension sends chat requests and streams responses; it does not manage GPU settings or model files.

## Troubleshooting Models

- Empty list: run `ollama list`, then install a model with `ollama pull`.
- Slow first token: allow the model to load into memory.
- HTTP 500: inspect Ollama logs and try a smaller model.
- CUDA startup failure: see [Ollama connection troubleshooting](../troubleshooting/OLLAMA_CONNECTION.md#cuda-initialization-failure).
