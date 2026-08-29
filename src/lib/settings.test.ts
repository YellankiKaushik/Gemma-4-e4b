import { afterEach, describe, expect, it, vi } from "vitest";

import { defaultSettings, loadSettings, saveSettings } from "./settings";

function installLocalStorage(initial: Record<string, string> = {}) {
    const store = new Map(Object.entries(initial));
    vi.stubGlobal("localStorage", {
        getItem: vi.fn((key: string) => store.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store.set(key, value);
        }),
    });
    return store;
}

describe("settings persistence", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("saves and loads browser-development settings through localStorage fallback", async () => {
        installLocalStorage();

        await saveSettings({
            ...defaultSettings,
            endpoint: "http://127.0.0.1:11434",
            selectedModel: "gemma4:e4b",
            systemPrompt: "Be concise.",
            temperature: 0.2,
            historyLimit: 12,
            onboardingComplete: true,
        });

        await expect(loadSettings()).resolves.toMatchObject({
            endpoint: "http://127.0.0.1:11434",
            selectedModel: "gemma4:e4b",
            systemPrompt: "Be concise.",
            temperature: 0.2,
            historyLimit: 12,
            onboardingComplete: true,
        });
    });

    it("coerces stored remote endpoints back to the default local endpoint", async () => {
        installLocalStorage({
            "local-ai-side-panel:settings": JSON.stringify({
                ...defaultSettings,
                endpoint: "https://example.com",
            }),
        });

        await expect(loadSettings()).resolves.toMatchObject({
            endpoint: "http://localhost:11434",
        });
    });
});
