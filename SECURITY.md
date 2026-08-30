# Security Policy

## Scope

Local AI Side Panel is a Chrome Manifest V3 extension that communicates with loopback Ollama endpoints. Security-sensitive areas include manifest permissions, endpoint validation, model-output rendering, message persistence, and extension-origin setup guidance.

## Supported version

The current release candidate is v0.1.0. Security fixes should target the current default branch unless a release explicitly states otherwise.

## Reporting a vulnerability

Please do not disclose an unpatched vulnerability in a public issue. Contact the maintainer at `<SECURITY_CONTACT_EMAIL>` with:

- a short description of the issue;
- affected version or commit;
- reproducible steps or a minimal proof of concept;
- impact and any suggested mitigation.

Replace the contact placeholder before public release. Do not include prompts, conversation history, API keys, or unrelated private information.

## Security design notes

- The manifest intentionally requests only `sidePanel`, `storage`, and two loopback Ollama host permissions.
- The extension has no content scripts, `tabs`, `activeTab`, `scripting`, `<all_urls>`, cookies, history, or webRequest permissions.
- Model output is rendered as escaped React text, not raw HTML.
- Ollama endpoints are restricted to `http://localhost:<port>` and `http://127.0.0.1:<port>`.
- `OLLAMA_ORIGINS` setup commands are displayed for the user to run; the extension does not execute them or modify the operating system.

See [Privacy Policy](PRIVACY_POLICY.md) for data handling and [Architecture](docs/ARCHITECTURE.md) for runtime boundaries.
