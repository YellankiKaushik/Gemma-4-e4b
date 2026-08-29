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
            theme: "dark",
        });

        await expect(loadSettings()).resolves.toMatchObject({
            endpoint: "http://127.0.0.1:11434",
            selectedModel: "gemma4:e4b",
            systemPrompt: "Be concise.",
            temperature: 0.2,
            historyLimit: 12,
            onboardingComplete: true,
            theme: "dark",
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

    it("defaults new users to system theme", async () => {
        installLocalStorage();

        await expect(loadSettings()).resolves.toMatchObject({
            theme: "system",
        });
    });

    it("loads stored light, dark, and system theme values", async () => {
        for (const theme of ["light", "dark", "system"] as const) {
            installLocalStorage({
                "local-ai-side-panel:settings": JSON.stringify({
                    ...defaultSettings,
                    theme,
                }),
            });

            await expect(loadSettings()).resolves.toMatchObject({ theme });
            vi.unstubAllGlobals();
        }
    });

    it("falls back to system for invalid stored theme values", async () => {
        installLocalStorage({
            "local-ai-side-panel:settings": JSON.stringify({
                ...defaultSettings,
                theme: "solarized",
            }),
        });

        await expect(loadSettings()).resolves.toMatchObject({
            theme: "system",
        });
    });

    it("migrates old settings objects without a theme", async () => {
        installLocalStorage({
            "local-ai-side-panel:settings": JSON.stringify({
                endpoint: "http://localhost:11434",
                selectedModel: "gemma4:e4b",
                systemPrompt: "",
                temperature: 0.7,
                historyLimit: 20,
                onboardingComplete: true,
            }),
        });

        await expect(loadSettings()).resolves.toMatchObject({
            selectedModel: "gemma4:e4b",
            theme: "system",
        });
    });
});
