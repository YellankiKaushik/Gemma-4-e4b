# Branding

Local AI Side Panel needs independent release artwork before final Chrome Web Store submission.

## Required Extension Icons

The manifest currently references:

```text
icons/icon-16.png
icons/icon-32.png
icons/icon-48.png
icons/icon-128.png
```

Required practical sizes:

- 16x16
- 32x32
- 48x48
- 128x128

Do not change the manifest paths unless the package verifier is updated at the same time.

## Store Icon

- 128x128 px

## Store Promotional Tile

- 440x280 px

## Optional Marquee

- 1400x560 px

## Current Icon State

The current `public/icons/` files are functional placeholder PNGs. They are suitable for local package verification, but final independent artwork is still required before store submission.

## Integration Workflow

Once final artwork exists:

1. Export icon PNGs.
2. Replace the files in `public/icons/`.
3. Run `pnpm run build`.
4. Run `pnpm run verify:extension`.
5. Run `pnpm run package`.
6. Inspect the release ZIP root.
7. Visually inspect the extension in Chrome.

## Restrictions

Do not use:

- Google's Gemma logo
- Ollama's llama logo
- Google Chrome logo
- Google logo
- copied third-party marks

Use a simple geometric/local-network motif that remains legible at small sizes.
