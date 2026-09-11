# Final Release QA

Final QA must be performed from the exact generated release ZIP, not only from `dist/`.

## Procedure

1. Run:

```sh
pnpm run package
```

2. Use:

```text
release/Local-AI-Side-Panel-0.1.1.zip
```

3. Extract it to a clean temporary folder.

4. Verify the extracted root contains:

```text
manifest.json
sidepanel.html
service-worker.js
assets/
icons/
```

5. Load through Chrome:

```text
chrome://extensions
Developer Mode
Load unpacked
select extracted folder
```

## Manual Checklist

```text
Side Panel               PASS / FAIL
Dark                     PASS / FAIL
Light                    PASS / FAIL
Auto                     PASS / FAIL
Ollama connection        PASS / FAIL
Model discovery          PASS / FAIL
Real inference           PASS / FAIL
Streaming                PASS / FAIL
Stop                     PASS / FAIL
History persistence      PASS / FAIL
Settings persistence     PASS / FAIL
403 origin setup         PASS / FAIL
Copy OLLAMA_ORIGINS      PASS / FAIL
New icon renders properly PASS / FAIL
```

Also verify:

- send after Stop works
- extension reload persistence
- Chrome restart persistence
- displayed extension origin uses current `chrome.runtime.id`
- Copy extension origin works
- Copy Windows `OLLAMA_ORIGINS` command contains the exact current extension ID
- Retry works after Ollama restart

Do not mark these passed until they are tested from the extracted release ZIP.
