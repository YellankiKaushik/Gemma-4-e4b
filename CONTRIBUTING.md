# Contributing

Thank you for helping improve Local AI Side Panel.

## Before opening a change

Read:

- [Development](docs/development/DEVELOPMENT.md)
- [Architecture](docs/development/ARCHITECTURE.md)
- [Security](SECURITY.md)
- [Project expectations](#project-expectations)

Keep pull requests focused and preserve the project's local-only scope. Do not add cloud inference, analytics, account systems, content scripts, broad page permissions, or remote executable code.

## Local checks

Run the checks relevant to your change:

```sh
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify:extension
```

Run `pnpm run package` when validating release artifacts.

## Pull requests

Describe the user-visible change, files touched, tests run, and any manual Chrome/Ollama checks. Call out changes to manifest permissions, endpoint policy, settings, history, or streaming explicitly.

Do not include prompts, private conversation data, API keys, machine paths, or full local logs in commits or issue reports.

## Project expectations

Be precise, respectful, and constructive. Assume good intent, discuss evidence, and keep technical disagreement focused on the code and user impact.

## License

By contributing, you agree that your contribution is provided under the repository's [Apache License 2.0](LICENSE).
