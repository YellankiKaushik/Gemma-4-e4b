// CMP-OLLAMA-001 / CMP-STREAM-001 — all Ollama HTTP + NDJSON framing lives here.
import { AppError, type LocalModel, type MessageRole } from "./types";
import { normalizeLocalEndpoint } from "./local-endpoint";

export const DEFAULT_ENDPOINT = "http://localhost:11434";

export interface ChatRequest {
    endpoint: string;
    model: string;
    messages: { role: MessageRole; content: string }[];
    temperature?: number;
}

export interface ChatChunk {
    content: string;
    done: boolean;
    meta?: {
        totalDurationMs?: number;
        evalCount?: number;
        promptEvalCount?: number;
    };
}

function normalizeEndpoint(endpoint: string) {
    const normalized = normalizeLocalEndpoint(endpoint);
    if (!normalized) {
        throw new AppError(
            "INVALID_ENDPOINT",
            "Only http://localhost:<port> and http://127.0.0.1:<port> endpoints are allowed",
        );
    }
    return normalized;
}

export async function listModels(endpoint: string, timeoutMs = 3000): Promise<LocalModel[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
        res = await fetch(`${normalizeEndpoint(endpoint)}/api/tags`, {
            signal: controller.signal,
        });
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError("LOCAL_RUNTIME_UNREACHABLE", "Ollama is not reachable");
    } finally {
        clearTimeout(timer);
    }

    if (!res.ok) {
        throw new AppError("LOCAL_RUNTIME_UNREACHABLE", `Runtime responded ${res.status}`);
    }

    const data = (await res.json()) as {
        models?: {
            name?: string;
            size?: number;
            modified_at?: string;
            details?: { parameter_size?: string; quantization_level?: string };
        }[];
    };

    // Tolerate unknown additive fields (§10.5).
    return (data.models ?? [])
        .filter((m) => typeof m.name === "string")
        .map((m) => ({
            name: m.name as string,
            size: m.size,
            modifiedAt: m.modified_at,
            parameterSize: m.details?.parameter_size,
            quantization: m.details?.quantization_level,
        }));
}

/** Model preference algorithm (§8.8). Never auto-downloads. */
export function resolvePreferredModel(
    models: LocalModel[],
    previouslySelected: string | null,
): string | null {
    const names = models.map((m) => m.name);
    if (previouslySelected && names.includes(previouslySelected)) return previouslySelected;
    if (names.includes("gemma4:e4b")) return "gemma4:e4b";
    if (names.includes("gemma4:latest")) return "gemma4:latest";
    const gemma = names.find((n) => n.startsWith("gemma4:") || n.startsWith("gemma"));
    if (gemma) return gemma;
    return names[0] ?? null;
}

function parseStreamFrame(line: string): ChatChunk {
    let frame: Record<string, unknown>;
    try {
        frame = JSON.parse(line);
    } catch {
        throw new AppError("STREAM_PARSE_ERROR", "Malformed stream frame", line.slice(0, 200));
    }

    if (typeof frame["error"] === "string") {
        const message = frame["error"] as string;
        if (/context|too long/i.test(message)) {
            throw new AppError("CONTEXT_LIMIT", message);
        }
        throw new AppError("MODEL_REQUEST_REJECTED", message);
    }

    const message = frame["message"] as { content?: string } | undefined;
    const doneFlag = frame["done"] === true;
    const chunk: ChatChunk = {
        content: typeof message?.content === "string" ? message.content : "",
        done: doneFlag,
    };
    if (doneFlag) {
        chunk.meta = {};
        if (typeof frame["total_duration"] === "number") {
            chunk.meta.totalDurationMs = Math.round((frame["total_duration"] as number) / 1e6);
        }
        if (typeof frame["eval_count"] === "number") {
            chunk.meta.evalCount = frame["eval_count"] as number;
        }
        if (typeof frame["prompt_eval_count"] === "number") {
            chunk.meta.promptEvalCount = frame["prompt_eval_count"] as number;
        }
    }
    return chunk;
}

export async function* chatStream(
    request: ChatRequest,
    signal: AbortSignal,
): AsyncGenerator<ChatChunk> {
    let res: Response;
    try {
        res = await fetch(`${normalizeEndpoint(request.endpoint)}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal,
            body: JSON.stringify({
                model: request.model,
                messages: request.messages,
                stream: true,
                options:
                    request.temperature === undefined ? {} : { temperature: request.temperature },
            }),
        });
    } catch (err) {
        if (err instanceof AppError) throw err;
        if (signal.aborted) throw new AppError("REQUEST_ABORTED", "Generation stopped");
        throw new AppError("LOCAL_RUNTIME_UNREACHABLE", "Ollama is not reachable", String(err));
    }

    if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        if (res.status === 404 || /not found|try pulling/i.test(text)) {
            throw new AppError(
                "MODEL_NOT_FOUND",
                `Model "${request.model}" is not installed`,
                text,
            );
        }
        throw new AppError("MODEL_REQUEST_REJECTED", `Ollama returned ${res.status}`, text);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let newline: number;
            while ((newline = buffer.indexOf("\n")) !== -1) {
                const line = buffer.slice(0, newline).trim();
                buffer = buffer.slice(newline + 1);
                if (!line) continue;

                const chunk = parseStreamFrame(line);
                yield chunk;
                if (chunk.done) return;
            }
        }
        const trailing = buffer.trim();
        if (trailing) {
            const chunk = parseStreamFrame(trailing);
            yield chunk;
        }
    } catch (err) {
        if (signal.aborted) throw new AppError("REQUEST_ABORTED", "Generation stopped");
        throw err;
    } finally {
        reader.cancel().catch(() => undefined);
    }
}
