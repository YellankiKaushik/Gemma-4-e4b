// Settings live in chrome.storage.local for the extension. The localStorage
// fallback only keeps regular-browser development usable.
import { DEFAULT_ENDPOINT } from "./ollama";
import { coerceLocalEndpoint } from "./local-endpoint";
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

function normalizeSettings(settings: Partial<Settings>): Settings {
    return {
        ...defaultSettings,
        ...settings,
        endpoint: coerceLocalEndpoint(settings.endpoint ?? defaultSettings.endpoint),
        temperature:
            typeof settings.temperature === "number" && Number.isFinite(settings.temperature)
                ? settings.temperature
                : defaultSettings.temperature,
        historyLimit:
            typeof settings.historyLimit === "number" && Number.isFinite(settings.historyLimit)
                ? settings.historyLimit
                : defaultSettings.historyLimit,
    };
}

function hasChromeStorage(): boolean {
    return typeof chrome !== "undefined" && Boolean(chrome.storage?.local);
}

async function loadFromChromeStorage(): Promise<Settings> {
    return new Promise((resolve) => {
        chrome.storage.local.get(KEY, (items) => {
            if (chrome.runtime.lastError) {
                resolve(defaultSettings);
                return;
            }
            resolve(normalizeSettings((items[KEY] as Partial<Settings> | undefined) ?? {}));
        });
    });
}

async function saveToChromeStorage(settings: Settings): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [KEY]: normalizeSettings(settings) }, () => resolve());
    });
}

function loadFromLocalStorage(): Settings {
    if (typeof localStorage === "undefined") return defaultSettings;
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return defaultSettings;
        return normalizeSettings(JSON.parse(raw) as Partial<Settings>);
    } catch {
        return defaultSettings;
    }
}

function saveToLocalStorage(settings: Settings): void {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(KEY, JSON.stringify(normalizeSettings(settings)));
    } catch {
        /* storage unavailable - settings stay in memory */
    }
}

export async function loadSettings(): Promise<Settings> {
    if (hasChromeStorage()) return loadFromChromeStorage();
    return loadFromLocalStorage();
}

export async function saveSettings(settings: Settings): Promise<void> {
    if (hasChromeStorage()) {
        await saveToChromeStorage(settings);
        return;
    }
    saveToLocalStorage(settings);
}
