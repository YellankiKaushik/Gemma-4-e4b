import { useEffect, useState, type ReactNode } from "react";
import {
    ChevronDown,
    History,
    Menu,
    MessageCircle,
    PanelLeft,
    Settings2,
    Wifi,
    WifiOff,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChatView } from "@/components/ChatView";
import { ConversationList } from "@/components/ConversationList";
import { RuntimePanel } from "@/components/RuntimePanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useLocalAI } from "@/hooks/useLocalAI";
import { resolveThemeMode } from "@/lib/theme";
import { cn } from "@/lib/utils";

function StatusIndicator({ ready }: { ready: boolean }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-surface-secondary px-2.5 py-1 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", ready ? "bg-success" : "bg-warning")} />
            {ready ? "Connected" : "Ollama unavailable"}
        </span>
    );
}

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

    const navItems: { value: typeof view; label: string; icon: ReactNode }[] = [
        { value: "chat", label: "Chat", icon: <MessageCircle className="size-4" /> },
        { value: "history", label: "History", icon: <History className="size-4" /> },
        { value: "settings", label: "Settings", icon: <Settings2 className="size-4" /> },
    ];

    return (
        <div className="flex h-svh min-h-[560px] overflow-hidden bg-background text-foreground">
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-30 w-[302px] border-r border-sidebar-border bg-sidebar transition-transform duration-200 min-[620px]:static min-[620px]:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-full flex-col">
                    <div className="flex min-h-[76px] items-center justify-between px-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sidebar-accent shadow-subtle ring-1 ring-sidebar-border">
                                <img
                                    src="/icons/icon-48.png"
                                    alt=""
                                    className="size-7 rounded-lg"
                                />
                            </span>
                            <div className="min-w-0">
                                <h1 className="truncate text-sm font-semibold">
                                    Local AI Side Panel
                                </h1>
                                <div className="truncate text-xs text-muted-foreground">
                                    Private local chat
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="min-[620px]:hidden"
                            aria-label="Close navigation"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    <div className="px-4 pb-4">
                        <Button className="w-full justify-center" onClick={createConversation}>
                            <PanelLeft className="size-4" /> New conversation
                        </Button>
                    </div>

                    <div className="px-4 pb-3">
                        <div
                            className="grid grid-cols-3 gap-1 rounded-full bg-surface-secondary p-1"
                            role="tablist"
                            aria-label="Primary views"
                        >
                            {navItems.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={view === item.value}
                                    onClick={() => {
                                        setView(item.value);
                                        setSidebarOpen(false);
                                    }}
                                    className={cn(
                                        "flex h-9 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        view === item.value
                                            ? "bg-sidebar-accent text-sidebar-foreground shadow-subtle"
                                            : "text-muted-foreground hover:text-sidebar-foreground",
                                    )}
                                >
                                    {item.icon}
                                    <span className="hidden min-[360px]:inline">{item.label}</span>
                                </button>
                            ))}
                        </div>
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

                    <div className="p-4">
                        <div className="rounded-[1.375rem] bg-sidebar-accent p-4 shadow-subtle ring-1 ring-sidebar-border">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Ollama
                                </span>
                                <StatusIndicator ready={statusReady} />
                            </div>
                            <div className="mt-2 truncate font-mono text-[11px] text-muted-foreground">
                                {ai.settings.endpoint}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {sidebarOpen ? (
                <button
                    type="button"
                    aria-label="Close navigation overlay"
                    className="fixed inset-0 z-20 bg-background/70 backdrop-blur-sm min-[620px]:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            ) : null}

            <main className="flex min-w-0 flex-1 flex-col bg-background">
                <header className="flex min-h-[76px] items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="min-[620px]:hidden"
                            aria-label="Open navigation"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="size-5" />
                        </Button>
                        <div className="min-w-0">
                            <div className="truncate text-[0.9375rem] font-semibold">
                                {view === "settings"
                                    ? "Settings"
                                    : view === "history"
                                      ? "Conversation history"
                                      : (activeConversation?.title ?? "New conversation")}
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                                {statusReady ? (
                                    <>
                                        <Wifi className="size-3.5 text-success" /> Connected
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="size-3.5 text-warning" /> Ollama needs
                                        attention
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                        {view === "chat" && ai.models.length > 0 ? (
                            <label className="relative hidden min-w-0 items-center sm:flex">
                                <span className="sr-only">Select model</span>
                                <select
                                    aria-label="Select model"
                                    value={ai.settings.selectedModel ?? ""}
                                    onChange={(e) =>
                                        ai.patchSettings({ selectedModel: e.target.value })
                                    }
                                    className="h-10 max-w-[170px] appearance-none truncate rounded-full border border-input bg-background py-1 pl-3.5 pr-9 font-mono text-xs text-foreground shadow-subtle outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:shadow-glow min-[720px]:max-w-[230px]"
                                >
                                    {ai.models.map((model) => (
                                        <option key={model.name} value={model.name}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-muted-foreground" />
                            </label>
                        ) : null}
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Open settings"
                            title="Open settings"
                            onClick={() => setView("settings")}
                        >
                            <Settings2 className="size-4" />
                        </Button>
                    </div>
                </header>

                {view === "settings" ? (
                    <SettingsPanel
                        settings={ai.settings}
                        runtimeState={ai.runtimeState}
                        models={ai.models}
                        onChange={ai.patchSettings}
                        onExport={() => void ai.exportAll()}
                        onClearAll={() => void ai.clearAll()}
                    />
                ) : view === "history" ? (
                    <div className="flex-1 overflow-y-auto bg-background p-5 sm:p-7">
                        <div className="mx-auto max-w-3xl">
                            <div className="mb-6 flex items-end justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-semibold leading-tight">
                                        Conversation history
                                    </h2>
                                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                                        Stored locally in IndexedDB.
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-surface-secondary px-3 py-1.5 text-xs text-muted-foreground">
                                    {ai.conversations.length} threads
                                </span>
                            </div>
                            <div className="space-y-2">
                                {ai.conversations.map((conversation) => (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        onClick={() => selectConversation(conversation.id)}
                                        className="flex w-full items-center justify-between gap-4 rounded-2xl bg-surface-secondary px-4 py-3.5 text-left transition-[background-color,box-shadow] duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                                    <div className="rounded-[1.75rem] bg-surface-secondary p-10 text-center text-sm text-muted-foreground">
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
                        errorCode={ai.runtimeErrorCode}
                        onRetry={ai.retryPreflight}
                    />
                )}
            </main>
        </div>
    );
}
