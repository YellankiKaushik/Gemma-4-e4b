# Chrome Web Store Privacy Draft

## Single Purpose

Provide a Chrome Side Panel interface for chatting with AI models running locally through Ollama.

## Data Use

- The extension does not sell user data.
- The extension does not use advertising.
- The extension does not use analytics.
- The extension does not collect prompts remotely.
- The extension does not collect model responses remotely.
- The extension does not use data for unrelated purposes.

## Data Stored Locally

- Conversation history is stored in IndexedDB in the user's Chrome profile.
- Settings are stored in `chrome.storage.local`.
- Stored settings may include theme, selected model, system prompt, endpoint, temperature, and history depth.

## Network Communication

The extension communicates with loopback Ollama API hosts on the user's own computer:

- `http://localhost:11434/*`
- `http://127.0.0.1:11434/*`

No project-controlled cloud AI backend is used.

## Permission Justification

`sidePanel`:

Required to display the local AI chat interface alongside webpages in Chrome's Side Panel.

`storage`:

Required to persist user settings such as theme, selected model, system prompt, and generation preferences.

Host permissions:

`http://localhost:11434/*` and `http://127.0.0.1:11434/*` are required to communicate with the user's locally running Ollama API. These hosts are loopback addresses on the user's own computer.

## Notes For Submission

Do not claim that prompts never leave the user's computer unless the final submitted code still enforces loopback-only endpoints. The current implementation does enforce loopback-only endpoints.

Support contact: kaushikyellanki@gmail.com
