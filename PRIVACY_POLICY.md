# Privacy Policy

## Summary

Local AI Side Panel is designed to operate locally. It provides a Chrome Side Panel interface for chatting with AI models running through Ollama on the user's own computer.

## Data Processed

The extension may process:

- user prompts
- model responses
- conversation history
- extension settings
- selected local model
- system prompt

## Where Data Is Stored

- Conversations and messages are stored in IndexedDB in the user's Chrome profile.
- Settings are stored in `chrome.storage.local`.

## Network Communication

The extension communicates only with user-configured loopback Ollama endpoints allowed by the application:

- `http://localhost:<port>`
- `http://127.0.0.1:<port>`

The default endpoint is `http://localhost:11434`.

## No Project Cloud Backend

Local AI Side Panel does not provide or use a project cloud inference backend.

- no prompt telemetry
- no response telemetry
- no project cloud inference service
- no analytics service
- no advertising SDK
- no user account backend
- no sale of user data

## User Controls

Users can:

- delete individual conversations
- clear all conversation history
- export local conversation data
- uninstall the extension

## Third-Party Software

Ollama and local AI models are third-party software governed by their respective terms, licenses, and privacy practices. Local AI Side Panel connects to the user's local Ollama API but does not install Ollama or bundle AI models.

## Changes

This policy may be updated as the extension changes. Material changes should be reflected in the project documentation and Chrome Web Store listing before publication.

## Contact

`<YOUR_SUPPORT_EMAIL>`

Replace this placeholder before submission.
