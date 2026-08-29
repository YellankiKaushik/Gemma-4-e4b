import { useState } from "react";
import { MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";

// FR-009 / FR-010 / FR-011 — history list with create, rename, delete.
export function ConversationList({
    conversations,
    activeId,
    onSelect,
    onNew,
    onRename,
    onDelete,
}: {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNew: () => void;
    onRename: (id: string, title: string) => void;
    onDelete: (id: string) => void;
}) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState("");

    return (
        <div className="flex h-full flex-col">
            <div className="p-3">
                <Button className="w-full justify-start" onClick={onNew}>
                    <Plus className="size-4" /> New chat
                </Button>
            </div>

            <div className="tag-mono px-4 pb-2 text-muted-foreground">
                history · {conversations.length}
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
                {conversations.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                        No conversations yet. Everything you start stays on this machine.
                    </p>
                ) : null}

                {conversations.map((c) => {
                    const active = c.id === activeId;
                    return (
                        <div
                            key={c.id}
                            className={cn(
                                "group flex items-center gap-2 rounded-md border border-transparent px-2 py-2 transition-colors",
                                active
                                    ? "border-border bg-sidebar-accent"
                                    : "hover:border-border hover:bg-sidebar-accent/60",
                            )}
                        >
                            <MessageSquare
                                className={cn(
                                    "size-4 shrink-0",
                                    active ? "text-primary" : "text-muted-foreground",
                                )}
                            />
                            {editingId === c.id ? (
                                <Input
                                    autoFocus
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onBlur={() => {
                                        onRename(c.id, draft);
                                        setEditingId(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            onRename(c.id, draft);
                                            setEditingId(null);
                                        }
                                        if (e.key === "Escape") setEditingId(null);
                                    }}
                                    className="h-7 text-xs"
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => onSelect(c.id)}
                                    className="min-w-0 flex-1 text-left"
                                >
                                    <span className="block truncate text-sm">{c.title}</span>
                                    <span className="tag-mono block truncate text-muted-foreground">
                                        {c.model}
                                    </span>
                                </button>
                            )}
                            <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                <button
                                    type="button"
                                    aria-label="Rename conversation"
                                    className="rounded p-1 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setDraft(c.title);
                                        setEditingId(c.id);
                                    }}
                                >
                                    <Pencil className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Delete conversation"
                                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                                    onClick={() => onDelete(c.id)}
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
