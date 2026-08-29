// CMP-SET-001 — SettingsRepository (§8.6). Local-only, no telemetry.
import { DEFAULT_ENDPOINT } from "./ollama";
import type { Settings } from "./types";

const KEY = "local-ai-side-panel:settings";

export const defaultSettings: Settings = {
    endpoint: DEFAULT_ENDPOINT,
    selectedModel: null,
    systemPrompt: "",
    temperature: 0.7,
    historyLimit: 20,
    onboardingComplete: false,
};

export function loadSettings(): Settings {
    if (typeof localStorage === "undefined") return defaultSettings;
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return defaultSettings;
        return { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) };
    } catch {
        return defaultSettings;
    }
}

export function saveSettings(settings: Settings): void {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
        /* storage unavailable — settings stay in memory */
    }
}
