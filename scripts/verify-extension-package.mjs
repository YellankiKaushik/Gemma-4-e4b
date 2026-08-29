import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const manifestPath = path.join(distDir, "manifest.json");

const expectedPermissions = ["sidePanel", "storage"];
const expectedHostPermissions = ["http://localhost:11434/*", "http://127.0.0.1:11434/*"];
const forbiddenPermissions = [
    "<all_urls>",
    "tabs",
    "history",
    "cookies",
    "webRequest",
    "activeTab",
    "scripting",
];

function fail(message) {
    return message;
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sameMembers(actual = [], expected = []) {
    return (
        Array.isArray(actual) &&
        actual.length === expected.length &&
        expected.every((item) => actual.includes(item))
    );
}

function existsInDist(relativePath) {
    return fs.existsSync(path.join(distDir, relativePath));
}

function collectManifestPaths(manifest) {
    const paths = [];
    if (manifest.background?.service_worker) paths.push(manifest.background.service_worker);
    if (manifest.side_panel?.default_path) paths.push(manifest.side_panel.default_path);
    for (const iconPath of Object.values(manifest.icons ?? {})) paths.push(iconPath);
    for (const iconPath of Object.values(manifest.action?.default_icon ?? {})) paths.push(iconPath);
    return [...new Set(paths)];
}

const errors = [];

if (!fs.existsSync(manifestPath)) {
    errors.push(fail("dist/manifest.json is missing"));
} else {
    const manifest = readJson(manifestPath);
    if (manifest.manifest_version !== 3) errors.push(fail("manifest_version must be 3"));
    if (manifest.version !== "0.1.0") errors.push(fail("manifest version must remain 0.1.0"));
    if (!manifest.name) errors.push(fail("manifest name is missing"));
    if (!manifest.description) errors.push(fail("manifest description is missing"));
    if (!manifest.minimum_chrome_version) {
        errors.push(fail("minimum_chrome_version is missing"));
    }
    if (!sameMembers(manifest.permissions, expectedPermissions)) {
        errors.push(fail(`permissions must be exactly ${JSON.stringify(expectedPermissions)}`));
    }
    if (!sameMembers(manifest.host_permissions, expectedHostPermissions)) {
        errors.push(
            fail(`host_permissions must be exactly ${JSON.stringify(expectedHostPermissions)}`),
        );
    }
    for (const permission of [
        ...(manifest.permissions ?? []),
        ...(manifest.host_permissions ?? []),
    ]) {
        if (forbiddenPermissions.includes(permission)) {
            errors.push(fail(`forbidden permission present: ${permission}`));
        }
    }
    if (manifest.background?.service_worker !== "service-worker.js") {
        errors.push(fail("background.service_worker must be service-worker.js"));
    }
    if (manifest.background?.type !== "module") {
        errors.push(fail("background.type must be module"));
    }
    if (manifest.side_panel?.default_path !== "sidepanel.html") {
        errors.push(fail("side_panel.default_path must be sidepanel.html"));
    }
    if (!manifest.action?.default_title) errors.push(fail("action.default_title is missing"));
    const csp = manifest.content_security_policy?.extension_pages ?? "";
    if (!csp.includes("script-src 'self'") || !csp.includes("object-src 'self'")) {
        errors.push(fail("strict MV3 CSP is missing script-src/object-src self"));
    }
    if (/unsafe-eval|https?:\/\//i.test(csp)) {
        errors.push(fail("CSP must not allow unsafe-eval or remote executable scripts"));
    }
    for (const relativePath of collectManifestPaths(manifest)) {
        if (!existsInDist(relativePath)) {
            errors.push(fail(`manifest references missing file: ${relativePath}`));
        }
    }
}

if (!existsInDist("sidepanel.html")) errors.push(fail("dist/sidepanel.html is missing"));
if (!existsInDist("service-worker.js")) errors.push(fail("dist/service-worker.js is missing"));
if (!fs.existsSync(path.join(distDir, "assets"))) errors.push(fail("dist/assets is missing"));
if (!fs.existsSync(path.join(distDir, "icons"))) errors.push(fail("dist/icons is missing"));

if (errors.length > 0) {
    console.error("Extension package verification failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
}

console.log("Extension package verification passed.");
console.log(`permissions=${JSON.stringify(expectedPermissions)}`);
console.log(`host_permissions=${JSON.stringify(expectedHostPermissions)}`);
console.log("forbidden_permissions_present=false");
