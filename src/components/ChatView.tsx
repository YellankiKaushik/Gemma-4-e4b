import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowUp, Bot, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton, MessageContent } from "@/components/MessageContent";
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

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: "end" });
    }, [messages]);

    const submit = () => {
        if (!input.trim() || busy) return;
        onSend(input);
        setInput("");
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-5">
                    {messages.length === 0 ? (
                        <div className="panel-grid mx-auto mt-10 max-w-lg rounded-2xl border border-border p-7 text-center shadow-subtle">
                            <span className="mx-auto flex size-10 items-center justify-center rounded-xl border border-border bg-surface-secondary text-primary">
                                <Bot className="size-5" />
                            </span>
                            <h2 className="mt-4 text-xl font-semibold tracking-tight">
                                Gemma Local AI
                            </h2>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                Your local AI, running on this computer. Ask anything to get
                                started.
                            </p>
                            <p className="mt-4 truncate font-mono text-xs text-muted-foreground">
                                {model ?? "no model selected"}
                            </p>
                        </div>
                    ) : null}

                    {messages.map((m) => (
                        <article
                            key={m.id}
                            className={cn(
                                "group flex flex-col gap-2",
                                m.role === "user" ? "items-end" : "items-start",
                            )}
                        >
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                    {m.role === "user"
                                        ? "you"
                                        : (m.generation?.model ?? "assistant")}
                                </span>
                                {m.status === "stopped" ? (
                                    <span className="text-warning">stopped</span>
                                ) : null}
                                {m.status === "error" ? (
                                    <span className="text-destructive">{m.errorCode}</span>
                                ) : null}
                            </div>

                            <div
                                className={cn(
                                    "max-w-[min(42rem,92%)] rounded-2xl border px-4 py-3 shadow-subtle",
                                    m.role === "user"
                                        ? "border-primary/20 bg-primary text-primary-foreground"
                                        : "border-border bg-surface",
                                    m.status === "error" &&
                                        "border-destructive/30 bg-destructive/10 text-foreground",
                                )}
                            >
                                {m.status === "error" ? (
                                    <div className="flex gap-2 text-sm">
                                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                                        <div>
                                            <p>
                                                {m.errorCode
                                                    ? ERROR_GUIDANCE[m.errorCode]
                                                    : "Request failed."}
                                            </p>
                                            {m.content ? (
                                                <p className="mt-1 font-mono text-xs text-muted-foreground break-words">
                                                    {m.content}
                                                </p>
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
                                <div className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                                    <CopyButton value={m.content} />
                                    {m.generation?.evalCount ? (
                                        <span className="tag-mono text-muted-foreground">
                                            {m.generation.evalCount} tok
                                            {m.generation.totalDurationMs
                                                ? ` · ${(m.generation.totalDurationMs / 1000).toFixed(1)}s`
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

            <div className="border-t border-border bg-surface/85 px-4 py-4 backdrop-blur sm:px-5">
                <div className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-subtle transition-shadow focus-within:shadow-glow">
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
                        className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                    />
                    {busy ? (
                        <Button
                            variant="secondary"
                            size="default"
                            onClick={onStop}
                            aria-label="Stop generating"
                        >
                            <Square className="size-4" /> Stop
                        </Button>
                    ) : (
                        <Button
                            size="icon"
                            onClick={submit}
                            disabled={!input.trim() || !model}
                            aria-label="Send message"
                        >
                            <ArrowUp className="size-4" />
                        </Button>
                    )}
                </div>
                <p className="mx-auto mt-2 w-full max-w-3xl text-xs text-muted-foreground">
                    Enter to send. Shift+Enter for a new line. Local inference only.
                </p>
            </div>
        </div>
    );
}
