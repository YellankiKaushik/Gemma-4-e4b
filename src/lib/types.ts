// Shared domain types (see DEEP_TECHNICAL_ARCHITECTURE §10, §12)

export type MessageRole = "system" | "user" | "assistant";
export type MessageStatus = "complete" | "streaming" | "stopped" | "error";

export interface GenerationMeta {
    model?: string | undefined;
    totalDurationMs?: number | undefined;
    evalCount?: number | undefined;
    promptEvalCount?: number | undefined;
}

export interface Message {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    status: MessageStatus;
    createdAt: string;
    generation?: GenerationMeta | undefined;
    errorCode?: AppErrorCode | undefined;
}

export interface Conversation {
    id: string;
    title: string;
    model: string;
    createdAt: string;
    updatedAt: string;
}

export interface LocalModel {
    name: string;
    size?: number | undefined;
    parameterSize?: string | undefined;
    quantization?: string | undefined;
    modifiedAt?: string | undefined;
}

export type AppErrorCode =
    | "LOCAL_RUNTIME_UNREACHABLE"
    | "MODEL_NOT_FOUND"
    | "MODEL_REQUEST_REJECTED"
    | "STREAM_PARSE_ERROR"
    | "REQUEST_ABORTED"
    | "CONTEXT_LIMIT"
    | "STORAGE_ERROR"
    | "UNKNOWN";

export class AppError extends Error {
    code: AppErrorCode;
    detail?: string | undefined;
    constructor(code: AppErrorCode, message: string, detail?: string) {
        super(message);
        this.code = code;
        if (detail !== undefined) this.detail = detail;
    }
}

export const ERROR_GUIDANCE: Record<AppErrorCode, string> = {
    LOCAL_RUNTIME_UNREACHABLE:
        "The local Ollama runtime could not be reached. Start Ollama and allow this origin.",
    MODEL_NOT_FOUND: "The selected model is no longer installed. Pick another model.",
    MODEL_REQUEST_REJECTED: "Ollama rejected the request.",
    STREAM_PARSE_ERROR: "The response stream was malformed. Try again.",
    REQUEST_ABORTED: "Generation stopped.",
    CONTEXT_LIMIT: "Context limit reached. Start a new chat or reduce history depth.",
    STORAGE_ERROR: "Local storage is unavailable.",
    UNKNOWN: "Something went wrong.",
};

export type RuntimeState =
    | "checking_runtime"
    | "runtime_unavailable"
    | "checking_models"
    | "no_models"
    | "ready";

export interface Settings {
    endpoint: string;
    selectedModel: string | null;
    systemPrompt: string;
    temperature: number;
    historyLimit: number;
    onboardingComplete: boolean;
}
