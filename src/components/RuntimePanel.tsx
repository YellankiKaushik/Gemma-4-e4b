import { AlertTriangle, Loader2, PackageOpen, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/MessageContent";
import { getExtensionOrigin, getWindowsOllamaOriginsCommand } from "@/lib/extension-origin";
import type { AppErrorCode, RuntimeState } from "@/lib/types";

// CMP-ONB-001 - preflight / onboarding surface.
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
            <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
                <span className="flex size-12 items-center justify-center rounded-full bg-surface-secondary">
                    <Loader2 className="size-5 animate-spin text-primary" />
                </span>
                <p className="text-sm">
                    {state === "checking_runtime" ? "Checking local runtime" : "Discovering models"}
                </p>
            </div>
        );
    }

    const unreachable = state === "runtime_unavailable";
    const originRejected = errorCode === "OLLAMA_ORIGIN_REJECTED";
    const extensionOrigin = getExtensionOrigin();
    const windowsCommand = getWindowsOllamaOriginsCommand(extensionOrigin);

    return (
        <div className="flex flex-1 items-center justify-center bg-background p-5 sm:p-6">
            <div className="w-full max-w-xl rounded-[1.75rem] bg-surface p-6 shadow-panel ring-1 ring-border sm:p-7">
                <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface-secondary text-warning ring-1 ring-border">
                        {originRejected ? (
                            <ShieldAlert className="size-5" />
                        ) : unreachable ? (
                            <AlertTriangle className="size-5" />
                        ) : (
                            <PackageOpen className="size-5" />
                        )}
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold leading-7">
                            {originRejected
                                ? "Ollama needs permission"
                                : unreachable
                                  ? "Ollama is unavailable"
                                  : "No models installed"}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {originRejected
                                ? "Allow this extension origin, restart Ollama, then try again."
                                : unreachable
                                  ? "Start Ollama on this computer, then re-run preflight."
                                  : "Pull a local model before starting a conversation."}
                        </p>
                    </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-muted-foreground">
                    {originRejected ? (
                        <>
                            This extension is installed as{" "}
                            <span className="font-mono text-foreground">{extensionOrigin}</span>.
                            Add it to <span className="font-mono">OLLAMA_ORIGINS</span>, restart
                            Ollama completely, then retry.
                        </>
                    ) : unreachable ? (
                        <>
                            Local AI Side Panel talks directly to{" "}
                            <span className="font-mono text-foreground">{endpoint}</span>. Nothing
                            leaves your machine.
                        </>
                    ) : (
                        <>
                            Ollama is running, but there are no installed models. Models are never
                            downloaded automatically.
                        </>
                    )}
                </p>

                {originRejected ? (
                    <div className="mt-5 space-y-3 rounded-2xl bg-surface-secondary p-4 ring-1 ring-border">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Extension origin
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-foreground">
                                {extensionOrigin}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <CopyButton value={extensionOrigin} label="Copy origin" />
                            <CopyButton value={windowsCommand} label="Copy Windows command" />
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">
                            Restart Ollama completely after changing this setting.
                        </p>
                    </div>
                ) : null}

                <div className="mt-5 overflow-hidden rounded-2xl bg-surface-secondary ring-1 ring-border">
                    <div className="border-b border-border px-4 py-2.5">
                        <span className="text-xs font-medium text-muted-foreground">Setup</span>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
                        <code>
                            {unreachable
                                ? `# 1. start the runtime\nollama serve\n\n# 2. if Chrome blocks the extension origin, restart Ollama with:\nOLLAMA_ORIGINS="${extensionOrigin}" ollama serve`
                                : `ollama pull gemma4:e4b\nollama list`}
                        </code>
                    </pre>
                </div>

                {detail ? (
                    <p className="mt-4 rounded-2xl bg-surface-secondary p-4 font-mono text-xs leading-5 text-muted-foreground break-words">
                        {detail}
                    </p>
                ) : null}

                <Button className="mt-6" onClick={onRetry}>
                    <RefreshCw className="size-4" /> Re-run preflight
                </Button>
            </div>
        </div>
    );
}
