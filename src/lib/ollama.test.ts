import { afterEach, describe, expect, it, vi } from "vitest";

import { isAllowedLocalEndpoint } from "./local-endpoint";
import { chatStream, resolvePreferredModel, type ChatChunk } from "./ollama";
import { AppError, type LocalModel } from "./types";

function models(...names: string[]): LocalModel[] {
    return names.map((name) => ({ name }));
}

function streamFrom(chunks: string[]): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();
            for (const chunk of chunks) {
                controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
        },
    });
}

async function collectCurrentStream(signal = new AbortController().signal) {
    const received: ChatChunk[] = [];
    for await (const chunk of chatStream(
        {
            endpoint: "http://localhost:11434",
            model: "gemma4:e4b",
            messages: [{ role: "user", content: "test" }],
        },
        signal,
    )) {
        received.push(chunk);
    }
    return received;
}

async function collectStream(chunks: string[], signal = new AbortController().signal) {
    vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response(streamFrom(chunks), { status: 200 })),
    );

    return collectCurrentStream(signal);
}

describe("resolvePreferredModel", () => {
    it("keeps a previously selected installed model", () => {
        expect(resolvePreferredModel(models("gemma4:e4b", "llama3:latest"), "llama3:latest")).toBe(
            "llama3:latest",
        );
    });

    it("prefers gemma4:e4b when nothing is selected", () => {
        expect(resolvePreferredModel(models("llama3:latest", "gemma4:e4b"), null)).toBe(
            "gemma4:e4b",
        );
    });

    it("uses another Gemma model when exact E4B is unavailable", () => {
        expect(resolvePreferredModel(models("llama3:latest", "gemma4:latest"), null)).toBe(
            "gemma4:latest",
        );
    });

    it("uses the first available model when no Gemma model exists", () => {
        expect(resolvePreferredModel(models("mistral:latest", "llama3:latest"), null)).toBe(
            "mistral:latest",
        );
    });
});

describe("local endpoint validation", () => {
    it("allows local Ollama HTTP endpoints", () => {
        expect(isAllowedLocalEndpoint("http://localhost:11434")).toBe(true);
        expect(isAllowedLocalEndpoint("http://127.0.0.1:11434")).toBe(true);
    });

    it("rejects remote and non-loopback endpoints", () => {
        expect(isAllowedLocalEndpoint("https://example.com")).toBe(false);
        expect(isAllowedLocalEndpoint("http://google.com")).toBe(false);
        expect(isAllowedLocalEndpoint("http://192.168.1.2:11434")).toBe(false);
    });
});

describe("chatStream", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("parses multiple NDJSON frames", async () => {
        const chunks = await collectStream([
            '{"message":{"content":"LO"},"done":false}\n{"message":{"content":"CAL"},"done":true}\n',
        ]);

        expect(chunks.map((chunk) => chunk.content).join("")).toBe("LOCAL");
        expect(chunks.at(-1)?.done).toBe(true);
    });

    it("parses a frame split across chunks", async () => {
        const chunks = await collectStream([
            '{"message":{"content":"HEL',
            'LO"},"done":false}\n{"message":{"content":""},"done":true}\n',
        ]);

        expect(chunks[0]?.content).toBe("HELLO");
        expect(chunks.at(-1)?.done).toBe(true);
    });

    it("parses a final frame without a newline", async () => {
        const chunks = await collectStream(['{"message":{"content":"OK"},"done":true}']);

        expect(chunks).toHaveLength(1);
        expect(chunks[0]).toMatchObject({ content: "OK", done: true });
    });

    it("throws STREAM_PARSE_ERROR for malformed frames", async () => {
        await expect(collectStream(["not-json\n"])).rejects.toMatchObject({
            code: "STREAM_PARSE_ERROR",
        });
    });

    it("maps aborted fetches to REQUEST_ABORTED", async () => {
        const controller = new AbortController();
        controller.abort();
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => {
                throw new DOMException("This operation was aborted", "AbortError");
            }),
        );

        await expect(collectCurrentStream(controller.signal)).rejects.toBeInstanceOf(AppError);
        await expect(collectCurrentStream(controller.signal)).rejects.toMatchObject({
            code: "REQUEST_ABORTED",
        });
    });
});
