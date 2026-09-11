import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowUp, CircleStop, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton, MessageContent } from "@/components/MessageContent";
import { getExtensionOrigin, getWindowsOllamaOriginsCommand } from "@/lib/extension-origin";
import { cn } from "@/lib/utils";
import { ERROR_GUIDANCE, type Message } from "@/lib/types";
import type { ChatPhase } from "@/hooks/useLocalAI";

export function ChatView({
    messages,
    phase,
    model,
    onSend,
    onStop,
}: {
    messages: Message[];
    phase: ChatPhase;
    model: string | null;
    onSend: (text: string) => void;
    onStop: () => void;
}) {
    const [input, setInput] = useState("");
    const endRef = useRef<HTMLDivElement>(null);
    const busy = phase !== "idle";
    const extensionOrigin = getExtensionOrigin();
    const windowsCommand = getWindowsOllamaOriginsCommand(extensionOrigin);

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: "end" });
    }, [messages]);

    const submit = () => {
        if (!input.trim() || busy) return;
        onSend(input);
        setInput("");
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-background">
            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-7 sm:px-6">
                    {messages.length === 0 ? (
                        <div className="mx-auto flex min-h-[52svh] max-w-lg flex-col items-center justify-center px-2 text-center">
                            <span className="flex size-16 items-center justify-center rounded-[1.375rem] bg-surface-secondary shadow-subtle ring-1 ring-border">
                                <img
                                    src="/icons/icon-48.png"
                                    alt=""
                                    className="size-10 rounded-xl"
                                />
                            </span>
                            <h2 className="mt-6 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                                Local AI Side Panel
                            </h2>
                            <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-muted-foreground">
                                Your local AI, right beside the browser.
                            </p>
                            <div className="mt-7 flex max-w-full items-center gap-2 rounded-full bg-surface-secondary px-3 py-2 text-xs text-muted-foreground">
                                <Sparkles className="size-3.5 text-primary" />
                                <span className="truncate font-mono">
                                    {model ?? "Select a model to begin"}
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {messages.map((m) => (
                        <article
                            key={m.id}
                            className={cn(
                                "group flex flex-col gap-2.5",
                                m.role === "user" ? "items-end" : "items-start",
                            )}
                        >
                            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                                <span>
                                    {m.role === "user"
                                        ? "You"
                                        : (m.generation?.model ?? "Assistant")}
                                </span>
                                {m.status === "stopped" ? (
                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-warning">
                                        Stopped
                                    </span>
                                ) : null}
                                {m.status === "error" ? (
                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-destructive">
                                        {m.errorCode}
                                    </span>
                                ) : null}
                            </div>

                            <div
                                className={cn(
                                    "max-w-[min(46rem,92%)] rounded-[1.375rem] px-4 py-3.5 text-[0.9375rem] shadow-subtle sm:px-5",
                                    m.role === "user"
                                        ? "max-w-[min(36rem,78%)] bg-primary text-primary-foreground"
                                        : "bg-surface-secondary text-foreground",
                                    m.status === "error" &&
                                        "border border-destructive/30 bg-surface text-foreground",
                                )}
                            >
                                {m.status === "error" ? (
                                    <div className="flex gap-3 text-sm leading-6">
                                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-destructive">
                                            <AlertTriangle className="size-4" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="font-medium">
                                                {m.errorCode
                                                    ? ERROR_GUIDANCE[m.errorCode]
                                                    : "Request failed."}
                                            </p>
                                            {m.content ? (
                                                <p className="mt-2 break-words font-mono text-xs leading-5 text-muted-foreground">
                                                    {m.content}
                                                </p>
                                            ) : null}
                                            {m.errorCode === "OLLAMA_ORIGIN_REJECTED" ? (
                                                <div className="mt-4 space-y-3 rounded-2xl bg-surface-secondary p-3 ring-1 ring-border">
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">
                                                            Extension origin
                                                        </p>
                                                        <p className="mt-1 break-all font-mono text-xs text-foreground">
                                                            {extensionOrigin}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <CopyButton
                                                            value={extensionOrigin}
                                                            label="Copy origin"
                                                        />
                                                        <CopyButton
                                                            value={windowsCommand}
                                                            label="Copy Windows command"
                                                        />
                                                    </div>
                                                    <p className="text-xs leading-5 text-muted-foreground">
                                                        Restart Ollama completely after changing
                                                        this setting.
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <MessageContent content={m.content} />
                                        {m.status === "streaming" ? (
                                            <span className="stream-caret" />
                                        ) : null}
                                    </>
                                )}
                            </div>

                            {m.role === "assistant" && m.status !== "streaming" && m.content ? (
                                <div className="flex items-center gap-3 px-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                                    <CopyButton value={m.content} />
                                    {m.generation?.evalCount ? (
                                        <span className="tag-mono text-muted-foreground">
                                            {m.generation.evalCount} tok
                                            {m.generation.totalDurationMs
                                                ? ` / ${(m.generation.totalDurationMs / 1000).toFixed(1)}s`
                                                : ""}
                                        </span>
                                    ) : null}
                                </div>
                            ) : null}
                        </article>
                    ))}
                    <div ref={endRef} />
                </div>
            </div>

            <div className="border-t border-border bg-surface/90 px-4 py-4 backdrop-blur sm:px-5">
                <div className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-[1.375rem] bg-background p-2 shadow-subtle ring-1 ring-input transition-shadow duration-150 focus-within:shadow-glow focus-within:ring-ring">
                    <textarea
                        rows={1}
                        value={input}
                        disabled={!model}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                submit();
                            }
                        }}
                        placeholder={model ? "Ask your local model..." : "Select a model first"}
                        className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[0.9375rem] leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                    />
                    {busy ? (
                        <Button
                            variant="secondary"
                            size="default"
                            onClick={onStop}
                            aria-label="Stop generating"
                        >
                            <CircleStop className="size-4" /> Stop
                        </Button>
                    ) : (
                        <Button
                            size="icon"
                            onClick={submit}
                            disabled={!input.trim() || !model}
                            aria-label="Send message"
                            title="Send message"
                        >
                            <ArrowUp className="size-4" />
                        </Button>
                    )}
                </div>
                <p className="mx-auto mt-2.5 w-full max-w-3xl text-xs text-muted-foreground">
                    Enter to send. Shift+Enter for a new line. Local inference only.
                </p>
            </div>
        </div>
    );
}
