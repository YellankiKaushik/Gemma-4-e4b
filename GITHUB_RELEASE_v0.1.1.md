# Local AI Side Panel v0.1.1

Local AI Side Panel v0.1.1 is a visual polish release focused on the premium UI/UX redesign that passed manual Chrome and Ollama QA.

The local-only architecture remains unchanged: the extension still communicates directly with Ollama on your computer, stores conversations locally, and keeps the same Chrome permissions as v0.1.0.

## Highlights

- Premium Apple-inspired visual redesign
- Improved typography, spacing, radius, and surface hierarchy
- Refined sidebar, navigation, and conversation list states
- Redesigned chat messages, first-run empty state, and composer
- Improved Light and Dark themes with preserved Auto/System theme behavior
- Better Ollama runtime, unavailable, no-model, and permission error states
- Improved responsive Chrome Side Panel behavior across narrow and expanded widths
- Accessibility and reduced-motion improvements
- No changes to local-only architecture, Ollama integration, persisted storage, or Chrome permissions

## Preserved Behavior

- Chrome Manifest V3 Side Panel behavior
- Direct local Ollama integration
- Local model discovery and model selection
- Streaming responses
- Stop generation
- Multiple conversations and local history
- Rename, delete, clear history, and JSON export
- System prompt, temperature, and history depth settings
- IndexedDB conversation persistence
- chrome.storage.local settings persistence
- Light, Dark, and Auto themes
- Dynamic extension-origin setup for Ollama 403 handling
- Loopback-only endpoint policy

## Requirements

- Google Chrome 116+
- Ollama
- At least one compatible local chat model

Gemma 4 E4B is recommended, but other compatible Ollama chat models can also be used.

## Privacy

Chats and settings are stored locally in Chrome.

AI inference is sent directly to Ollama running on your own computer.

Local AI Side Panel does not use a project-controlled cloud inference backend.

## Release Asset

```text
Local-AI-Side-Panel-0.1.1.zip
```
