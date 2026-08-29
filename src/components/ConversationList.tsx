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

            <div className="flex items-center justify-between px-4 pb-2 text-xs text-muted-foreground">
                <span>Conversations</span>
                <span>{conversations.length}</span>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
                {conversations.length === 0 ? (
                    <div className="mx-1 rounded-xl border border-dashed border-border bg-sidebar-accent/50 px-4 py-6 text-center">
                        <p className="text-sm font-medium">No conversations yet</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Your chats stay on this device.
                        </p>
                    </div>
                ) : null}

                {conversations.map((c) => {
                    const active = c.id === activeId;
                    return (
                        <div
                            key={c.id}
                            className={cn(
                                "group flex min-h-12 items-center gap-2 rounded-lg border border-transparent px-2 py-2 transition-colors",
                                active
                                    ? "border-sidebar-border bg-sidebar-accent"
                                    : "hover:bg-sidebar-accent/70",
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
                                    className="h-8 text-sm"
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => onSelect(c.id)}
                                    className="min-w-0 flex-1 text-left"
                                >
                                    <span className="block truncate text-sm font-medium">
                                        {c.title}
                                    </span>
                                    <span className="block truncate font-mono text-[11px] text-muted-foreground">
                                        {c.model}
                                    </span>
                                </button>
                            )}
                            <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                <button
                                    type="button"
                                    aria-label="Rename conversation"
                                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-secondary hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
