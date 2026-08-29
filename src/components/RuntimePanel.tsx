import { AlertTriangle, Loader2, PackageOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/MessageContent";
import { getExtensionOrigin, getWindowsOllamaOriginsCommand } from "@/lib/extension-origin";
import type { AppErrorCode, RuntimeState } from "@/lib/types";

// CMP-ONB-001 — preflight / onboarding surface (§8.8, FR-017).
export function RuntimePanel({
    state,
    endpoint,
    onRetry,
    detail,
    errorCode,
}: {
    state: RuntimeState;
    endpoint: string;
    onRetry: () => void;
    detail?: string | undefined;
    errorCode?: AppErrorCode | undefined;
}) {
    if (state === "checking_runtime" || state === "checking_models") {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <p className="text-sm">
                    {state === "checking_runtime" ? "checking local runtime" : "discovering models"}
                </p>
            </div>
        );
    }

    const unreachable = state === "runtime_unavailable";
    const originRejected = errorCode === "OLLAMA_ORIGIN_REJECTED";
    const extensionOrigin = getExtensionOrigin();
    const windowsCommand = getWindowsOllamaOriginsCommand(extensionOrigin);

    return (
        <div className="flex flex-1 items-center justify-center p-5 sm:p-6">
            <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-panel">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-secondary text-warning">
                        {unreachable ? (
                            <AlertTriangle className="size-4" />
                        ) : (
                            <PackageOpen className="size-4" />
                        )}
                    </span>
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight">
                            {originRejected
                                ? "Ollama needs permission"
                                : unreachable
                                  ? "Ollama isn't running"
                                  : "No models installed"}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {originRejected
                                ? "Allow this extension origin, then restart Ollama."
                                : unreachable
                                  ? "Start Ollama on this computer, then try again."
                                  : "Pull a local model to begin chatting."}
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {originRejected ? (
                        <>
                            This extension is installed as{" "}
                            <span className="font-mono text-foreground">{extensionOrigin}</span>.
                            Add that origin to <span className="font-mono">OLLAMA_ORIGINS</span>,
                            restart Ollama completely, then retry.
                        </>
                    ) : unreachable ? (
                        <>
                            This app talks directly to Ollama at{" "}
                            <span className="font-mono text-foreground">{endpoint}</span>. Nothing
                            leaves your machine. Start the runtime and allow this browser origin.
                        </>
                    ) : (
                        <>
                            Ollama is running but no models are installed. Pull a Gemma model to get
                            started. Models are never downloaded automatically.
                        </>
                    )}
                </p>

                {originRejected ? (
                    <div className="mt-4 space-y-3 rounded-xl border border-border bg-surface-secondary p-3">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Extension origin
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-foreground">
                                {extensionOrigin}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <CopyButton value={extensionOrigin} label="Copy extension origin" />
                            <CopyButton value={windowsCommand} label="Copy Windows command" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Restart Ollama completely after changing this setting.
                        </p>
                    </div>
                ) : null}

                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-secondary">
                    <div className="border-b border-border px-3 py-2">
                        <span className="text-xs font-medium text-muted-foreground">Setup</span>
                    </div>
                    <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-foreground">
                        <code>
                            {unreachable
                                ? `# 1. start the runtime\nollama serve\n\n# 2. if Chrome blocks the extension origin, restart Ollama with:\nOLLAMA_ORIGINS="${extensionOrigin}" ollama serve`
                                : `ollama pull gemma4:e4b\nollama list`}
                        </code>
                    </pre>
                </div>

                {detail ? (
                    <p className="mt-3 rounded-lg bg-surface-secondary p-3 font-mono text-xs text-muted-foreground break-words">
                        {detail}
                    </p>
                ) : null}

                <Button className="mt-5" onClick={onRetry}>
                    <RefreshCw className="size-4" /> Re-run preflight
                </Button>
            </div>
        </div>
    );
}
