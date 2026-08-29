import { describe, expect, it } from "vitest";

import { normalizeThemeMode, resolveThemeMode } from "./theme";

describe("theme mode", () => {
    it("normalizes invalid theme values to system", () => {
        expect(normalizeThemeMode("light")).toBe("light");
        expect(normalizeThemeMode("dark")).toBe("dark");
        expect(normalizeThemeMode("system")).toBe("system");
        expect(normalizeThemeMode("sepia")).toBe("system");
        expect(normalizeThemeMode(undefined)).toBe("system");
    });

    it("resolves system mode from the current color-scheme preference", () => {
        expect(resolveThemeMode("system", true)).toBe("dark");
        expect(resolveThemeMode("system", false)).toBe("light");
    });

    it("keeps explicit light and dark choices independent of system preference", () => {
        expect(resolveThemeMode("light", true)).toBe("light");
        expect(resolveThemeMode("dark", false)).toBe("dark");
    });
});
