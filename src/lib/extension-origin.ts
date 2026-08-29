const EXTENSION_ORIGIN_FALLBACK = "chrome-extension://<EXTENSION_ID>";

export function getExtensionOrigin(): string {
    if (typeof chrome !== "undefined" && typeof chrome.runtime?.id === "string") {
        return `chrome-extension://${chrome.runtime.id}`;
    }
    return EXTENSION_ORIGIN_FALLBACK;
}

export function getWindowsOllamaOriginsCommand(origin = getExtensionOrigin()): string {
    return `[Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS","${origin}","User")`;
}
