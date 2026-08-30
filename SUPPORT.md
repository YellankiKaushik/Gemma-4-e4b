# Support

Start with the guide that matches the problem:

- [Installation](docs/INSTALLATION.md)
- [Ollama setup](docs/OLLAMA_SETUP.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [FAQ](docs/FAQ.md)
- [Privacy policy](PRIVACY_POLICY.md)

## Before opening an issue

Please include the Chrome version, operating system, Ollama version, model name, and a short reproduction sequence. Remove prompts, conversation text, API keys, machine paths, and full local logs.

For a reproducible bug, use the [bug report template](https://github.com/YellankiKaushik/Gemma-4-e4b/issues/new?template=bug_report.yml). Security issues should follow [SECURITY.md](SECURITY.md) instead of being posted publicly.

## Common quick fixes

- If Ollama is unavailable, start it and click Retry.
- If no model is found, run `ollama list` or `ollama pull gemma4:e4b`.
- If Ollama returns 403, allow the exact `chrome-extension://...` origin shown by the extension in `OLLAMA_ORIGINS`, then restart Ollama completely.
- If Ollama returns 500, inspect the local model/runtime logs rather than changing extension permissions.
- For the specific CUDA PDL initialization failure only, see the optional `GGML_CUDA_PDL=0` guidance in [Troubleshooting](docs/TROUBLESHOOTING.md).
