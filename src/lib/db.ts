// CMP-HIST-001 — ConversationRepository backed by IndexedDB (§8.5, §12.4).
import { AppError, type Conversation, type Message } from "./types";

const DB_NAME = "local-ai-side-panel";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
    if (typeof indexedDB === "undefined") {
        return Promise.reject(new AppError("STORAGE_ERROR", "IndexedDB unavailable"));
    }
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains("conversations")) {
                    const store = db.createObjectStore("conversations", { keyPath: "id" });
                    store.createIndex("updatedAt", "updatedAt");
                }
                if (!db.objectStoreNames.contains("messages")) {
                    const store = db.createObjectStore("messages", { keyPath: "id" });
                    store.createIndex("conversation_createdAt", ["conversationId", "createdAt"]);
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new AppError("STORAGE_ERROR", "Could not open local database"));
        });
    }
    return dbPromise;
}

function tx<T>(
    storeNames: string | string[],
    mode: IDBTransactionMode,
    run: (stores: IDBObjectStore[]) => IDBRequest<T> | void,
): Promise<T | undefined> {
    return openDb().then(
        (db) =>
            new Promise<T | undefined>((resolve, reject) => {
                const names = Array.isArray(storeNames) ? storeNames : [storeNames];
                const t = db.transaction(names, mode);
                const allStores = names.map((n) => t.objectStore(n));
                const firstStore = allStores[0];
                if (!firstStore) {
                    reject(new AppError("STORAGE_ERROR", "Local database store unavailable"));
                    return;
                }
                const request = run(allStores);
                let result: T | undefined;
                if (request) request.onsuccess = () => (result = request.result);
                t.oncomplete = () => resolve(result);
                t.onerror = () => reject(new AppError("STORAGE_ERROR", "Local storage operation failed"));
            }),
    );
}

export function uuid(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const conversationRepository = {
    async createConversation(model: string, title = "New chat"): Promise<Conversation> {
        const now = new Date().toISOString();
        const conversation: Conversation = { id: uuid(), title, model, createdAt: now, updatedAt: now };
        await tx("conversations", "readwrite", (stores) => {
            const store = stores[0];
            if (!store) return;
            store.put(conversation);
        });
        return conversation;
    },

    async listConversations(): Promise<Conversation[]> {
        const all = await tx<Conversation[]>("conversations", "readonly", (stores) => {
            const store = stores[0];
            return store?.getAll() as IDBRequest<Conversation[]> | undefined;
        });
        return (all ?? []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        const all = await tx<Message[]>("messages", "readonly", (stores) => {
            const store = stores[0];
            return store?.index("conversation_createdAt").getAll(
                IDBKeyRange.bound([conversationId, ""], [conversationId, "\uffff"]),
            ) as IDBRequest<Message[]> | undefined;
        });
        return all ?? [];
    },

    async renameConversation(id: string, title: string): Promise<void> {
        const existing = await tx<Conversation>("conversations", "readonly", (stores) => {
            const store = stores[0];
            return store?.get(id) as IDBRequest<Conversation> | undefined;
        });
        if (!existing) return;
        await tx("conversations", "readwrite", (stores) => {
            const store = stores[0];
            if (!store) return;
            store.put({ ...existing, title, updatedAt: new Date().toISOString() });
        });
    },

    async touchConversation(id: string, patch: Partial<Conversation> = {}): Promise<void> {
        const existing = await tx<Conversation>("conversations", "readonly", (stores) => {
            const store = stores[0];
            return store?.get(id) as IDBRequest<Conversation> | undefined;
        });
        if (!existing) return;
        await tx("conversations", "readwrite", (stores) => {
            const store = stores[0];
            if (!store) return;
            store.put({ ...existing, ...patch, updatedAt: new Date().toISOString() });
        });
    },

    async deleteConversation(id: string): Promise<void> {
        const messages = await this.getMessages(id);
        await tx(["conversations", "messages"], "readwrite", ([conversations, messageStore]) => {
            if (!conversations || !messageStore) return;
            conversations.delete(id);
            messages.forEach((m) => messageStore.delete(m.id));
        });
    },

    async appendMessage(message: Message): Promise<void> {
        await tx("messages", "readwrite", (stores) => {
            const store = stores[0];
            if (!store) return;
            store.put(message);
        });
        await this.touchConversation(message.conversationId);
    },

    async updateMessage(message: Message): Promise<void> {
        await tx("messages", "readwrite", (stores) => {
            const store = stores[0];
            if (!store) return;
            store.put(message);
        });
    },

    async clearAll(): Promise<void> {
        await tx(["conversations", "messages"], "readwrite", ([conversations, messages]) => {
            if (!conversations || !messages) return;
            conversations.clear();
            messages.clear();
        });
    },

    async exportAll(): Promise<{ conversations: Conversation[]; messages: Message[] }> {
        const conversations = await this.listConversations();
        const messages: Message[] = [];
        for (const c of conversations) messages.push(...(await this.getMessages(c.id)));
        return { conversations, messages };
    },
};
