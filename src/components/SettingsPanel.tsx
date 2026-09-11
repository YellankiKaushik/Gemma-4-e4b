import { useEffect, useState, type ReactNode } from "react";
import { Check, Download, Moon, Monitor, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/MessageContent";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { getExtensionOrigin } from "@/lib/extension-origin";
import { isAllowedLocalEndpoint, normalizeLocalEndpoint } from "@/lib/local-endpoint";
import { cn } from "@/lib/utils";
import type { LocalModel, RuntimeState, Settings, ThemeMode } from "@/lib/types";

function SettingSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-5 border-t border-border pt-6 first:border-t-0 first:pt-0">
            <div>
                <h3 className="text-base font-semibold leading-6">{title}</h3>
                {description ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                ) : null}
            </div>
            <div className="space-y-5">{children}</div>
        </section>
    );
}

function SettingRow({
    label,
    description,
    children,
}: {
    label: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2.5">
            <div className="space-y-1">
                <Label>{label}</Label>
                {description ? (
                    <p className="text-xs leading-5 text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {children}
        </div>
    );
}

// FR-013 / FR-018 - settings + local export and clear.
export function SettingsPanel({
    settings,
    runtimeState,
    models,
    onChange,
    onExport,
    onClearAll,
}: {
    settings: Settings;
    runtimeState: RuntimeState;
    models: LocalModel[];
    onChange: (patch: Partial<Settings>) => void;
    onExport: () => void;
    onClearAll: () => void;
}) {
    const [endpointDraft, setEndpointDraft] = useState(settings.endpoint);
    const normalizedEndpoint = normalizeLocalEndpoint(endpointDraft);
    const endpointChanged = normalizedEndpoint !== null && normalizedEndpoint !== settings.endpoint;
    const endpointValid = isAllowedLocalEndpoint(endpointDraft);
    const extensionOrigin = getExtensionOrigin();
    const runtimeConnected = runtimeState === "ready";

    useEffect(() => {
        setEndpointDraft(settings.endpoint);
    }, [settings.endpoint]);

    const saveEndpoint = () => {
        if (!normalizedEndpoint) return;
        onChange({ endpoint: normalizedEndpoint });
    };

    const themeOptions: { value: ThemeMode; label: string; icon: ReactNode }[] = [
        { value: "system", label: "Auto", icon: <Monitor className="size-4" /> },
        { value: "light", label: "Light", icon: <Sun className="size-4" /> },
        { value: "dark", label: "Dark", icon: <Moon className="size-4" /> },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-background">
            <div className="mx-auto w-full max-w-2xl p-5 sm:p-7">
                <header className="pb-7">
                    <h2 className="text-3xl font-semibold leading-tight">Settings</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Stored locally in this browser. No prompt or response telemetry is
                        collected.
                    </p>
                </header>

                <div className="rounded-[1.75rem] bg-surface p-5 shadow-subtle ring-1 ring-border sm:p-6">
                    <SettingSection
                        title="Appearance"
                        description="Auto follows your browser or operating-system color preference."
                    >
                        <div
                            className="grid grid-cols-3 gap-1 rounded-full bg-surface-secondary p-1"
                            role="radiogroup"
                            aria-label="Theme"
                        >
                            {themeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={settings.theme === option.value}
                                    onClick={() => onChange({ theme: option.value })}
                                    className={cn(
                                        "flex h-10 items-center justify-center gap-2 rounded-full px-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        settings.theme === option.value
                                            ? "bg-background text-foreground shadow-subtle"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {option.icon}
                                    <span className="truncate">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </SettingSection>

                    <SettingSection
                        title="Model"
                        description="Connect to a loopback Ollama runtime and choose an installed model."
                    >
                        <SettingRow
                            label="Ollama endpoint"
                            description="Loopback only. Use http://localhost:<port> or http://127.0.0.1:<port>."
                        >
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                    id="endpoint"
                                    className="font-mono"
                                    value={endpointDraft}
                                    onChange={(e) => setEndpointDraft(e.target.value)}
                                    onBlur={saveEndpoint}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") saveEndpoint();
                                    }}
                                    aria-invalid={!endpointValid}
                                />
                                {endpointChanged ? (
                                    <Button variant="secondary" onClick={saveEndpoint}>
                                        <Check className="size-4" /> Save
                                    </Button>
                                ) : null}
                            </div>
                            {!endpointValid ? (
                                <p className="text-xs leading-5 text-destructive">
                                    Remote, HTTPS, LAN, path, query, and credentialed endpoints are
                                    blocked.
                                </p>
                            ) : null}
                        </SettingRow>

                        <SettingRow label="Model">
                            <select
                                id="model"
                                value={settings.selectedModel ?? ""}
                                onChange={(e) => onChange({ selectedModel: e.target.value })}
                                className="apple-select h-11 w-full appearance-none truncate rounded-xl border border-input bg-background px-3.5 pr-8 font-mono text-sm text-foreground shadow-subtle outline-none transition-[border-color,box-shadow,background-color] duration-150 focus-visible:border-ring focus-visible:shadow-glow"
                            >
                                {models.length === 0 ? (
                                    <option value="">no models discovered</option>
                                ) : null}
                                {models.map((m) => (
                                    <option key={m.name} value={m.name}>
                                        {m.name}
                                        {m.parameterSize ? ` / ${m.parameterSize}` : ""}
                                    </option>
                                ))}
                            </select>
                        </SettingRow>

                        <SettingRow label="System prompt">
                            <Textarea
                                id="system"
                                rows={4}
                                placeholder="Optional instructions prepended to every conversation."
                                value={settings.systemPrompt}
                                onChange={(e) => onChange({ systemPrompt: e.target.value })}
                            />
                        </SettingRow>
                    </SettingSection>

                    <SettingSection
                        title="Generation"
                        description="Tune response style and how much local chat context is sent."
                    >
                        <SettingRow label="Temperature">
                            <div className="flex items-center gap-4">
                                <Slider
                                    aria-label="Temperature"
                                    value={[settings.temperature]}
                                    min={0}
                                    max={1.5}
                                    step={0.05}
                                    onValueChange={([v]) => onChange({ temperature: v ?? 0.7 })}
                                />
                                <span className="w-12 rounded-full bg-surface-secondary px-2 py-1 text-center font-mono text-xs text-muted-foreground">
                                    {settings.temperature.toFixed(2)}
                                </span>
                            </div>
                        </SettingRow>

                        <SettingRow label="History depth sent to the model">
                            <div className="flex items-center gap-4">
                                <Slider
                                    aria-label="History depth sent to the model"
                                    value={[settings.historyLimit]}
                                    min={2}
                                    max={60}
                                    step={2}
                                    onValueChange={([v]) => onChange({ historyLimit: v ?? 20 })}
                                />
                                <span className="w-16 rounded-full bg-surface-secondary px-2 py-1 text-center font-mono text-xs text-muted-foreground">
                                    {settings.historyLimit} msgs
                                </span>
                            </div>
                        </SettingRow>
                    </SettingSection>

                    <SettingSection
                        title="Data"
                        description="Conversations live in this browser's IndexedDB until you delete them."
                    >
                        <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" size="sm" onClick={onExport}>
                                <Download className="size-4" /> Export JSON
                            </Button>
                            <Button variant="destructive" size="sm" onClick={onClearAll}>
                                <Trash2 className="size-4" /> Clear all history
                            </Button>
                        </div>
                    </SettingSection>

                    <SettingSection title="Runtime">
                        <div className="space-y-4 rounded-2xl bg-surface-secondary p-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium">Ollama status</span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-subtle">
                                    <span
                                        className={cn(
                                            "size-2 rounded-full",
                                            runtimeConnected ? "bg-success" : "bg-warning",
                                        )}
                                    />
                                    {runtimeConnected ? "Connected" : "Unavailable"}
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Extension origin
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                                        {extensionOrigin}
                                    </p>
                                    <CopyButton value={extensionOrigin} label="Copy" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Endpoint
                                </p>
                                <p className="truncate font-mono text-xs text-muted-foreground">
                                    {settings.endpoint}
                                </p>
                            </div>
                        </div>
                    </SettingSection>
                </div>
            </div>
        </div>
    );
}
