import { useState } from "react";
import { Check, Copy } from "lucide-react";

// FR-015 — fenced code blocks render as plain text with a copy action.
// NFR-SEC-002: model output is never interpreted as HTML.

interface Block {
    type: "text" | "code";
    content: string;
    lang?: string;
}

function parseBlocks(content: string): Block[] {
    const blocks: Block[] = [];
    const regex = /```([\w+-]*)\n?([\s\S]*?)(?:```|$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            blocks.push({ type: "text", content: content.slice(lastIndex, match.index) });
        }
        blocks.push({ type: "code", lang: match[1] || "text", content: match[2] ?? "" });
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) {
        blocks.push({ type: "text", content: content.slice(lastIndex) });
    }
    return blocks.filter((b) => b.type === "code" || b.content.trim().length > 0);
}

function CopyButton({ value, label }: { value: string; label?: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={() => {
                navigator.clipboard?.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1400);
            }}
            className="tag-mono inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2 py-1 text-muted-foreground transition-colors hover:text-foreground"
        >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {label ?? (copied ? "copied" : "copy")}
        </button>
    );
}

export function MessageContent({ content }: { content: string }) {
    const blocks = parseBlocks(content);
    return (
        <div className="space-y-3">
            {blocks.map((block, i) =>
                block.type === "code" ? (
                    <figure key={i} className="overflow-hidden rounded-lg border border-border bg-background">
                        <figcaption className="flex items-center justify-between border-b border-border bg-surface px-3 py-1.5">
                            <span className="tag-mono text-muted-foreground">{block.lang}</span>
                            <CopyButton value={block.content} />
                        </figcaption>
                        <pre className="overflow-x-auto p-3 font-mono text-[0.8125rem] leading-relaxed">
                            <code>{block.content.replace(/\n$/, "")}</code>
                        </pre>
                    </figure>
                ) : (
                    <p key={i} className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">
                        {block.content.trim()}
                    </p>
                ),
            )}
        </div>
    );
}

export { CopyButton };
