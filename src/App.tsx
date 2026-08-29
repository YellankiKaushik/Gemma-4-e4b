import { useState } from "react";
import { Activity, ChevronDown, Menu, PanelLeft, Settings2, WifiOff, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChatView } from "@/components/ChatView";
import { ConversationList } from "@/components/ConversationList";
import { RuntimePanel } from "@/components/RuntimePanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useLocalAI } from "@/hooks/useLocalAI";
import { cn } from "@/lib/utils";

export function App() {
    const ai = useLocalAI();
    const [view, setView] = useState<"chat" | "history" | "settings">("chat");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const activeConversation = ai.conversations.find((c) => c.id === ai.activeId);
    const statusReady = ai.runtimeState === "ready";

    const selectConversation = (id: string) => {
        ai.setActiveId(id);
        setView("chat");
        setSidebarOpen(false);
    };

    const createConversation = () => {
        void ai.newConversation();
        setView("chat");
        setSidebarOpen(false);
    };

    return (
        <div className="flex h-svh min-h-[560px] overflow-hidden bg-background">
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-30 w-[286px] border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-[68px] items-center justify-between border-b border-sidebar-border px-4">
                        <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-primary/40 bg-accent text-primary shadow-glow">
                                <Activity className="size-4" />
                            </span>
                            <div>
                                <h1 className="text-sm font-bold tracking-tight">GEMMA</h1>
                                <div className="tag-mono text-muted-foreground">
                                    local side panel
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            aria-label="Close navigation"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    <div className="border-b border-sidebar-border p-3">
                        <Button className="w-full justify-start" onClick={createConversation}>
                            <PanelLeft className="size-4" /> New conversation
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 border-b border-sidebar-border p-2">
                        {(["chat", "history", "settings"] as const).map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => {
                                    setView(item);
                                    setSidebarOpen(false);
                                }}
                                className={cn(
                                    "tag-mono flex-1 rounded-md px-2 py-2 text-center transition-colors",
                                    view === item
                                        ? "bg-sidebar-accent text-sidebar-foreground"
                                        : "text-muted-foreground hover:text-sidebar-foreground",
                                )}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-0 flex-1">
                        <ConversationList
                            conversations={ai.conversations}
                            activeId={ai.activeId}
                            onSelect={selectConversation}
                            onNew={createConversation}
                            onRename={(id, title) => void ai.renameConversation(id, title)}
                            onDelete={(id) => void ai.deleteConversation(id)}
                        />
                    </div>

                    <div className="border-t border-sidebar-border p-4">
                        <div className="flex items-center justify-between">
                            <span className="tag-mono text-muted-foreground">runtime</span>
                            <span className="flex items-center gap-1.5 text-xs">
                                <span
                                    className={cn(
                                        "size-1.5 rounded-full",
                                        statusReady ? "bg-success" : "bg-warning",
                                    )}
                                />
                                {statusReady ? "connected" : "offline"}
                            </span>
                        </div>
                        <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
                            {ai.settings.endpoint}
                        </div>
                    </div>
                </div>
            </aside>

            {sidebarOpen ? (
                <button
                    type="button"
                    aria-label="Close navigation overlay"
                    className="fixed inset-0 z-20 bg-background/70 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            ) : null}

            <main className="flex min-w-0 flex-1 flex-col">
                <header className="flex min-h-[68px] items-center justify-between border-b border-border bg-surface/70 px-4 backdrop-blur sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            aria-label="Open navigation"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="size-5" />
                        </Button>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                                {view === "settings"
                                    ? "Settings"
                                    : (activeConversation?.title ?? "New conversation")}
                            </div>
                            <div className="tag-mono mt-0.5 flex items-center gap-2 text-muted-foreground">
                                {statusReady ? (
                                    <>
                                        <span className="text-success">.</span> ollama ready
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="size-3 text-warning" /> local runtime
                                        needs attention
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {view === "chat" && ai.models.length > 0 ? (
                            <label className="relative hidden items-center sm:flex">
                                <span className="sr-only">Select model</span>
                                <select
                                    aria-label="Select model"
                                    value={ai.settings.selectedModel ?? ""}
                                    onChange={(e) =>
                                        ai.patchSettings({ selectedModel: e.target.value })
                                    }
                                    className="h-9 max-w-[220px] appearance-none rounded-md border border-border bg-background py-1 pl-3 pr-8 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {ai.models.map((model) => (
                                        <option key={model.name} value={model.name}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground" />
                            </label>
                        ) : null}
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Open settings"
                            onClick={() => setView("settings")}
                        >
                            <Settings2 className="size-4" />
                        </Button>
                    </div>
                </header>

                {view === "settings" ? (
                    <SettingsPanel
                        settings={ai.settings}
                        models={ai.models}
                        onChange={ai.patchSettings}
                        onExport={() => void ai.exportAll()}
                        onClearAll={() => void ai.clearAll()}
                    />
                ) : view === "history" ? (
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-3xl">
                            <div className="mb-5 flex items-end justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">Conversation history</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Stored locally in IndexedDB.
                                    </p>
                                </div>
                                <span className="tag-mono text-muted-foreground">
                                    {ai.conversations.length} threads
                                </span>
                            </div>
                            <div className="space-y-2">
                                {ai.conversations.map((conversation) => (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        onClick={() => selectConversation(conversation.id)}
                                        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-surface-raised"
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-medium">
                                                {conversation.title}
                                            </span>
                                            <span className="tag-mono mt-1 block text-muted-foreground">
                                                {conversation.model}
                                            </span>
                                        </span>
                                        <span className="tag-mono shrink-0 text-muted-foreground">
                                            {new Date(conversation.updatedAt).toLocaleDateString()}
                                        </span>
                                    </button>
                                ))}
                                {ai.conversations.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                                        Your local conversations will appear here.
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : statusReady ? (
                    <ChatView
                        messages={ai.messages}
                        phase={ai.phase}
                        model={ai.settings.selectedModel}
                        onSend={(text) => void ai.send(text)}
                        onStop={ai.stop}
                    />
                ) : (
                    <RuntimePanel
                        state={ai.runtimeState}
                        endpoint={ai.settings.endpoint}
                        detail={ai.runtimeDetail}
                        onRetry={ai.retryPreflight}
                    />
                )}
            </main>
        </div>
    );
}
