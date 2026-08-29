const ALLOWED_HOSTS = new Set(["localhost", "127.0.0.1"]);
const DEFAULT_LOCAL_ENDPOINT = "http://localhost:11434";

export function normalizeLocalEndpoint(endpoint: string): string | null {
    const trimmed = endpoint.trim();
    if (!trimmed) return null;

    let url: URL;
    try {
        url = new URL(trimmed);
    } catch {
        return null;
    }

    if (url.protocol !== "http:") return null;
    if (!ALLOWED_HOSTS.has(url.hostname)) return null;
    if (!url.port) return null;
    if (url.username || url.password || url.search || url.hash) return null;
    if (url.pathname !== "/" && url.pathname !== "") return null;

    const port = Number(url.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return null;

    return `http://${url.hostname}:${url.port}`;
}

export function isAllowedLocalEndpoint(endpoint: string): boolean {
    return normalizeLocalEndpoint(endpoint) !== null;
}

export function coerceLocalEndpoint(endpoint: string): string {
    return normalizeLocalEndpoint(endpoint) ?? DEFAULT_LOCAL_ENDPOINT;
}
