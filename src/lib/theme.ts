import type { ResolvedTheme, ThemeMode } from "./types";

export function normalizeThemeMode(value: unknown): ThemeMode {
    return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function resolveThemeMode(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
    if (mode === "dark") return "dark";
    if (mode === "light") return "light";
    return prefersDark ? "dark" : "light";
}
