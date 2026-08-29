import { useEffect, useState } from "react";
import { Bot, ChevronDown, Menu, PanelLeft, Settings2, WifiOff, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChatView } from "@/components/ChatView";
import { ConversationList } from "@/components/ConversationList";
import { RuntimePanel } from "@/components/RuntimePanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useLocalAI } from "@/hooks/useLocalAI";
import { resolveThemeMode } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function App() {
    const ai = useLocalAI();
    const [view, setView] = useState<"chat" | "history" | "settings">("chat");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const activeConversation = ai.conversations.find((c) => c.id === ai.activeId);
    const statusReady = ai.runtimeState === "ready";

    useEffect(() => {
        const root = document.documentElement;
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const applyTheme = () => {
            const resolved = resolveThemeMode(ai.settings.theme, media.matches);
            root.setAttribute("data-theme", resolved);
            root.style.colorScheme = resolved;
        };

        applyTheme();
        media.addEventListener("change", applyTheme);
        return () => media.removeEventListener("change", applyTheme);
    }, [ai.settings.theme]);

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

    const navItems: { value: typeof view; label: string }[] = [
        { value: "chat", label: "Chat" },
        { value: "history", label: "History" },
        { value: "settings", label: "Settings" },
    ];

    return (
        <div className="flex h-svh min-h-[560px] overflow-hidden bg-background">
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-30 w-[286px] border-r border-sidebar-border bg-sidebar transition-transform duration-200 min-[580px]:static min-[580px]:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-[68px] items-center justify-between border-b border-sidebar-border px-4">
                        <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface-raised text-primary">
                                <Bot className="size-4" />
                            </span>
                            <div>
                                <h1 className="text-sm font-semibold tracking-tight">
                                    Gemma Local AI
                                </h1>
                                <div className="text-xs text-muted-foreground">
                                    Local side panel
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="min-[580px]:hidden"
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
                        {navItems.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                    setView(item.value);
                                    setSidebarOpen(false);
                                }}
                                className={cn(
                                    "flex-1 rounded-md px-2 py-2 text-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    view === item.value
                                        ? "bg-sidebar-accent text-sidebar-foreground"
                                        : "text-muted-foreground hover:text-sidebar-foreground",
                                )}
                            >
                                {item.label}
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
                            <span className="text-xs text-muted-foreground">Ollama</span>
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
                        <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                            {ai.settings.endpoint}
                        </div>
                    </div>
                </div>
            </aside>

            {sidebarOpen ? (
                <button
                    type="button"
                    aria-label="Close navigation overlay"
                    className="fixed inset-0 z-20 bg-background/70 min-[580px]:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            ) : null}

            <main className="flex min-w-0 flex-1 flex-col">
                <header className="flex min-h-[68px] items-center justify-between border-b border-border bg-surface/85 px-4 backdrop-blur sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="min-[580px]:hidden"
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
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                {statusReady ? (
                                    <>
                                        <span className="size-1.5 rounded-full bg-success" />{" "}
                                        Connected
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="size-3 text-warning" /> Ollama needs
                                        attention
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
                                    className="h-9 max-w-[180px] appearance-none truncate rounded-md border border-border bg-background py-1 pl-3 pr-8 font-mono text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring min-[720px]:max-w-[220px]"
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
                    <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                        <div className="mx-auto max-w-3xl">
                            <div className="mb-5 flex items-end justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">Conversation history</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Stored locally in IndexedDB.
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground">
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
                                            <span className="mt-1 block truncate font-mono text-[11px] text-muted-foreground">
                                                {conversation.model}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground">
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
