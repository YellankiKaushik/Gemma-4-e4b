# Release Checklist

## Automated checks

- [ ] format
- [ ] lint
- [ ] typecheck
- [ ] tests
- [ ] build
- [ ] manifest verification
- [ ] package

## Manual Chrome QA

- [ ] load unpacked
- [ ] toolbar action opens Side Panel
- [ ] Ollama detected
- [ ] `gemma4:e4b` detected
- [ ] real local inference works
- [ ] streaming visible
- [ ] Stop works
- [ ] second prompt works after Stop
- [ ] new conversation works
- [ ] rename works
- [ ] delete works
- [ ] clear history works
- [ ] export works
- [ ] conversations survive Side Panel close/reopen
- [ ] conversations survive Chrome restart
- [ ] conversations survive extension reload
- [ ] settings survive extension reload
- [ ] Ollama unavailable error state works
- [ ] Retry recovers after Ollama restarts

## Security

- [ ] no `<all_urls>`
- [ ] no unnecessary Chrome permissions
- [ ] no remote executable code
- [ ] no project cloud AI dependency
- [ ] no raw HTML execution from model output
- [ ] local-only endpoint restriction enforced
- [ ] permissions reviewed

## Runtime prerequisites

- [ ] OLLAMA_ORIGINS documented
- [ ] final production extension ID strategy documented
- [ ] GGML_CUDA_PDL workaround documented as optional troubleshooting only
