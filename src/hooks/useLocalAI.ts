import { useCallback, useEffect, useRef, useState } from "react";
import { conversationRepository, uuid } from "@/lib/db";
import { chatStream, listModels, resolvePreferredModel } from "@/lib/ollama";
import { defaultSettings, loadSettings, saveSettings } from "@/lib/settings";
import {
    AppError,
    type AppErrorCode,
    type Conversation,
    type LocalModel,
    type Message,
    type RuntimeState,
    type Settings,
} from "@/lib/types";

export type ChatPhase = "idle" | "preparing" | "streaming";

// CMP-CHAT-001 — ChatOrchestrator (§8.2) plus preflight wiring (§9.3).
export function useLocalAI() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [runtimeState, setRuntimeState] = useState<RuntimeState>("checking_runtime");
    const [runtimeDetail, setRuntimeDetail] = useState<string | undefined>();
    const [models, setModels] = useState<LocalModel[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [phase, setPhase] = useState<ChatPhase>("idle");
    const abortRef = useRef<AbortController | null>(null);

    const patchSettings = useCallback((patch: Partial<Settings>) => {
        setSettings((prev) => {
            const next = { ...prev, ...patch };
            saveSettings(next);
            return next;
        });
    }, []);

    const runPreflight = useCallback(
        async (endpoint: string, previouslySelected: string | null) => {
            setRuntimeState("checking_runtime");
            setRuntimeDetail(undefined);
            try {
                const discovered = await listModels(endpoint);
                setModels(discovered);
                if (discovered.length === 0) {
                    setRuntimeState("no_models");
                    return;
                }
                const preferred = resolvePreferredModel(discovered, previouslySelected);
                patchSettings({ selectedModel: preferred, onboardingComplete: true });
                setRuntimeState("ready");
            } catch (err) {
                setModels([]);
                setRuntimeDetail(err instanceof Error ? err.message : String(err));
                setRuntimeState("runtime_unavailable");
            }
        },
        [patchSettings],
    );

    // Boot: load settings, history, then preflight.
    useEffect(() => {
        const stored = loadSettings();
        setSettings(stored);
        conversationRepository
            .listConversations()
            .then((list) => {
                setConversations(list);
                if (list[0]) setActiveId(list[0].id);
            })
            .catch(() => undefined);
        void runPreflight(stored.endpoint, stored.selectedModel);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!activeId) {
            setMessages([]);
            return;
        }
        conversationRepository
            .getMessages(activeId)
            .then(setMessages)
            .catch(() => setMessages([]));
    }, [activeId]);

    const refreshConversations = useCallback(async () => {
        setConversations(await conversationRepository.listConversations());
    }, []);

    const newConversation = useCallback(async () => {
        const conversation = await conversationRepository.createConversation(
            settings.selectedModel ?? "unknown",
        );
        await refreshConversations();
        setActiveId(conversation.id);
        setMessages([]);
        return conversation;
    }, [refreshConversations, settings.selectedModel]);

    const deleteConversation = useCallback(
        async (id: string) => {
            await conversationRepository.deleteConversation(id);
            const list = await conversationRepository.listConversations();
            setConversations(list);
            if (activeId === id) setActiveId(list[0]?.id ?? null);
        },
        [activeId],
    );

    const renameConversation = useCallback(
        async (id: string, title: string) => {
            await conversationRepository.renameConversation(id, title.trim() || "Untitled");
            await refreshConversations();
        },
        [refreshConversations],
    );

    const stop = useCallback(() => {
        abortRef.current?.abort();
    }, []);

    const send = useCallback(
        async (input: string) => {
            const text = input.trim();
            if (!text || phase !== "idle") return;
            const model = settings.selectedModel;
            if (!model) return;

            setPhase("preparing");

            let conversation = conversations.find((c) => c.id === activeId) ?? null;
            if (!conversation) conversation = await newConversation();

            const userMessage: Message = {
                id: uuid(),
                conversationId: conversation.id,
                role: "user",
                content: text,
                status: "complete",
                createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMessage]);
            await conversationRepository.appendMessage(userMessage);

            const isFirst = messages.length === 0;
            if (isFirst) {
                await conversationRepository.renameConversation(
                    conversation.id,
                    text.slice(0, 48) + (text.length > 48 ? "…" : ""),
                );
            }
            await conversationRepository.touchConversation(conversation.id, { model });
            await refreshConversations();

            const assistant: Message = {
                id: uuid(),
                conversationId: conversation.id,
                role: "assistant",
                content: "",
                status: "streaming",
                createdAt: new Date().toISOString(),
                generation: { model },
            };
            setMessages((prev) => [...prev, assistant]);

            const history = [...messages, userMessage]
                .filter((m) => m.role !== "system" && m.status !== "error")
                .slice(-settings.historyLimit)
                .map((m) => ({ role: m.role, content: m.content }));

            const payload = settings.systemPrompt.trim()
                ? [{ role: "system" as const, content: settings.systemPrompt.trim() }, ...history]
                : history;

            const controller = new AbortController();
            abortRef.current = controller;
            setPhase("streaming");

            let acc = "";
            let finalStatus: Message["status"] = "complete";
            let errorCode: AppErrorCode | undefined;
            let generation = assistant.generation;

            try {
                for await (const chunk of chatStream(
                    {
                        endpoint: settings.endpoint,
                        model,
                        messages: payload,
                        temperature: settings.temperature,
                    },
                    controller.signal,
                )) {
                    if (chunk.content) {
                        acc += chunk.content;
                        setMessages((prev) =>
                            prev.map((m) => (m.id === assistant.id ? { ...m, content: acc } : m)),
                        );
                    }
                    if (chunk.done && chunk.meta) generation = { model, ...chunk.meta };
                }
            } catch (err) {
                const appError =
                    err instanceof AppError ? err : new AppError("UNKNOWN", String(err));
                if (appError.code === "REQUEST_ABORTED") {
                    finalStatus = "stopped";
                } else {
                    finalStatus = "error";
                    errorCode = appError.code;
                    acc = acc || appError.message;
                    if (appError.code === "LOCAL_RUNTIME_UNREACHABLE") {
                        setRuntimeState("runtime_unavailable");
                        setRuntimeDetail(appError.message);
                    }
                }
            } finally {
                abortRef.current = null;
            }

            const finalMessage: Message = {
                ...assistant,
                content: acc,
                status: finalStatus,
                generation,
                errorCode,
            };
            setMessages((prev) => prev.map((m) => (m.id === assistant.id ? finalMessage : m)));
            await conversationRepository.appendMessage(finalMessage);
            await refreshConversations();
            setPhase("idle");
        },
        [
            activeId,
            conversations,
            messages,
            newConversation,
            phase,
            refreshConversations,
            settings,
        ],
    );

    const clearAll = useCallback(async () => {
        await conversationRepository.clearAll();
        setConversations([]);
        setActiveId(null);
        setMessages([]);
    }, []);

    const exportAll = useCallback(async () => {
        const data = await conversationRepository.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `local-ai-history-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    return {
        settings,
        patchSettings,
        runtimeState,
        runtimeDetail,
        models,
        conversations,
        activeId,
        setActiveId,
        messages,
        phase,
        send,
        stop,
        newConversation,
        deleteConversation,
        renameConversation,
        clearAll,
        exportAll,
        retryPreflight: () => runPreflight(settings.endpoint, settings.selectedModel),
    };
}
