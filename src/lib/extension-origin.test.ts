import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { getExtensionOrigin, getWindowsOllamaOriginsCommand } from "./extension-origin";

function collectFiles(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return collectFiles(fullPath);
        return entry.isFile() ? [fullPath] : [];
    });
}

describe("extension origin helpers", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("builds the extension origin from chrome.runtime.id", () => {
        vi.stubGlobal("chrome", {
            runtime: { id: "abcdefghijklmnopabcdefghijklmnop" },
        });

        expect(getExtensionOrigin()).toBe("chrome-extension://abcdefghijklmnopabcdefghijklmnop");
    });

    it("uses a placeholder fallback outside Chrome extension runtime", () => {
        vi.stubGlobal("chrome", undefined);

        expect(getExtensionOrigin()).toBe("chrome-extension://<EXTENSION_ID>");
    });

    it("builds a copyable Windows OLLAMA_ORIGINS command from the exact origin", () => {
        expect(getWindowsOllamaOriginsCommand("chrome-extension://abc123")).toBe(
            '[Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS","chrome-extension://abc123","User")',
        );
    });

    it("does not contain the old development extension id", () => {
        const oldDevelopmentId = ["iggagall", "hogkbgj", "ndelifk", "dpfjbkahck"].join("");
        expect(getExtensionOrigin()).not.toContain(oldDevelopmentId);
        expect(getWindowsOllamaOriginsCommand()).not.toContain(oldDevelopmentId);
    });

    it("does not hard-code the old development extension id in production source", () => {
        const oldDevelopmentId = ["iggagall", "hogkbgj", "ndelifk", "dpfjbkahck"].join("");
        const productionFiles = [
            ...collectFiles(path.resolve("src")).filter((file) => !file.endsWith(".test.ts")),
            ...collectFiles(path.resolve("public")),
            path.resolve("sidepanel.html"),
            path.resolve("scripts/package-extension.mjs"),
            path.resolve("scripts/verify-extension-package.mjs"),
        ];

        for (const file of productionFiles) {
            expect(fs.readFileSync(file, "utf8"), file).not.toContain(oldDevelopmentId);
        }
    });
});
