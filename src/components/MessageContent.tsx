import { useState } from "react";
import { Check, Copy } from "lucide-react";

// FR-015 - fenced code blocks render as plain text with a copy action.
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
            className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-surface-raised px-2.5 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {label ?? (copied ? "Copied" : "Copy")}
        </button>
    );
}

function InlineText({ value }: { value: string }) {
    return (
        <>
            {value.split(/(`[^`]+`)/g).map((part, index) =>
                part.startsWith("`") && part.endsWith("`") && part.length > 1 ? (
                    <code
                        key={index}
                        className="rounded-md bg-surface-secondary px-1.5 py-0.5 font-mono text-[0.875em] text-foreground"
                    >
                        {part.slice(1, -1)}
                    </code>
                ) : (
                    <span key={index}>{part}</span>
                ),
            )}
        </>
    );
}

function TextBlock({ content }: { content: string }) {
    const lines = content.trim().split(/\n/);
    const nodes = [];

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i]?.trimEnd() ?? "";
        if (!line.trim()) continue;

        const heading = /^(#{1,3})\s+(.+)$/.exec(line);
        if (heading) {
            const level = heading[1]?.length ?? 1;
            const className =
                level === 1
                    ? "mt-5 text-lg font-semibold leading-7 first:mt-0"
                    : "mt-4 text-base font-semibold leading-6 first:mt-0";
            nodes.push(
                <p key={`heading-${i}`} className={className}>
                    <InlineText value={heading[2] ?? ""} />
                </p>,
            );
            continue;
        }

        if (/^[-*]\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^[-*]\s+/.test(lines[i]?.trim() ?? "")) {
                items.push((lines[i]?.trim() ?? "").replace(/^[-*]\s+/, ""));
                i += 1;
            }
            i -= 1;
            nodes.push(
                <ul key={`ul-${i}`} className="my-3 ml-5 list-disc space-y-1.5">
                    {items.map((item, index) => (
                        <li key={index}>
                            <InlineText value={item} />
                        </li>
                    ))}
                </ul>,
            );
            continue;
        }

        if (/^\d+\.\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s+/.test(lines[i]?.trim() ?? "")) {
                items.push((lines[i]?.trim() ?? "").replace(/^\d+\.\s+/, ""));
                i += 1;
            }
            i -= 1;
            nodes.push(
                <ol key={`ol-${i}`} className="my-3 ml-5 list-decimal space-y-1.5">
                    {items.map((item, index) => (
                        <li key={index}>
                            <InlineText value={item} />
                        </li>
                    ))}
                </ol>,
            );
            continue;
        }

        nodes.push(
            <p key={`p-${i}`} className="my-2.5 whitespace-pre-wrap first:mt-0 last:mb-0">
                <InlineText value={line.trim()} />
            </p>,
        );
    }

    return <>{nodes}</>;
}

export function MessageContent({ content }: { content: string }) {
    const blocks = parseBlocks(content);
    return (
        <div className="space-y-3.5">
            {blocks.map((block, i) =>
                block.type === "code" ? (
                    <figure
                        key={i}
                        className="overflow-hidden rounded-2xl border border-border bg-surface-secondary"
                    >
                        <figcaption className="flex items-center justify-between border-b border-border bg-surface-raised px-3 py-2">
                            <span className="font-mono text-xs text-muted-foreground">
                                {block.lang}
                            </span>
                            <CopyButton value={block.content} />
                        </figcaption>
                        <pre className="overflow-x-auto p-3.5 font-mono text-[0.8125rem] leading-6 text-foreground">
                            <code>{block.content.replace(/\n$/, "")}</code>
                        </pre>
                    </figure>
                ) : (
                    <div key={i} className="text-[0.9375rem] leading-7 text-foreground">
                        <TextBlock content={block.content} />
                    </div>
                ),
            )}
        </div>
    );
}

export { CopyButton };
