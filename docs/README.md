# Documentation

This directory keeps active user, developer, release, and security documentation for Local AI Side Panel. Historical reports and store-submission drafts are preserved under [Archive](archive/README.md).

## Getting Started

- [Installation](getting-started/INSTALLATION.md): build from source, load the unpacked extension, and update local builds.
- [Ollama setup](getting-started/OLLAMA_SETUP.md): install Ollama, pull a model, configure `OLLAMA_ORIGINS`, and restart the local runtime.

## User Guides

- [Usage](guides/USAGE.md): day-to-day chat, conversation, settings, export, and theme workflows.
- [Models](guides/MODELS.md): model discovery, recommended model, and local runtime expectations.
- [FAQ](guides/FAQ.md): short answers for privacy, storage, permissions, and common setup questions.

## Troubleshooting

- [Ollama connection](troubleshooting/OLLAMA_CONNECTION.md): focused recovery for unavailable runtime, HTTP 403, HTTP 500, empty model lists, and CUDA failures.
- [Troubleshooting](troubleshooting/TROUBLESHOOTING.md): broader symptom-based recovery guide.

## Development

- [Architecture](development/ARCHITECTURE.md): MV3 extension structure, data flow, and runtime boundaries.
- [Development](development/DEVELOPMENT.md): local commands, testing, build verification, and package workflow.
- [Git release tagging](development/GIT_RELEASE_TAGGING.md): manual tagging guardrails.
- [GitHub repository setup](development/GITHUB_REPOSITORY_SETUP.md): repository hygiene notes.

## Releases

- [Releasing](releases/RELEASING.md): release candidate preparation and packaging steps.
- [Release checklist](releases/RELEASE_CHECKLIST.md): manual checklist before distributing a ZIP.
- [Final release QA](releases/FINAL_RELEASE_QA.md): test the exact generated package.
- [Current GitHub release notes](releases/GITHUB_RELEASE.md): current manual GitHub Release draft.
- [v0.1.0 release notes](releases/v0.1.0/GITHUB_RELEASE.md)
- [v0.1.1 release notes](releases/v0.1.1/GITHUB_RELEASE.md)

## Security And Policy

- [Permissions](security/PERMISSIONS.md): exact Chrome permissions and host-permission rationale.
- [Security policy](../SECURITY.md): vulnerability reporting.
- [Privacy policy](../PRIVACY_POLICY.md): data handling.
- [Support](../SUPPORT.md): public support contact and issue-routing guidance.
