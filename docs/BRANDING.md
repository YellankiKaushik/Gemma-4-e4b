# Branding

Local AI Side Panel now has approved independent v0.1.0 extension icon artwork integrated.

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

The current `public/icons/` files are the approved v0.1.0 icon exports:

- `public/icons/icon-16.png`
- `public/icons/icon-32.png`
- `public/icons/icon-48.png`
- `public/icons/icon-128.png`

The cleaned master and matching exports are preserved under `branding/`.

## Integration Workflow

When refreshing or replacing approved artwork:

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

## Remaining Store Assets

The extension icon is complete for v0.1.0. These store-listing assets remain manual tasks:

- three real 1280x800 screenshots
- 440x280 promotional tile
- optional 1400x560 marquee
