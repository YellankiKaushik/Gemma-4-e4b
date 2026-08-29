import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { isAllowedLocalEndpoint, normalizeLocalEndpoint } from "@/lib/local-endpoint";
import type { LocalModel, Settings, ThemeMode } from "@/lib/types";

// FR-013 / FR-018 — settings + local export & clear (§12.6).
export function SettingsPanel({
    settings,
    models,
    onChange,
    onExport,
    onClearAll,
}: {
    settings: Settings;
    models: LocalModel[];
    onChange: (patch: Partial<Settings>) => void;
    onExport: () => void;
    onClearAll: () => void;
}) {
    const [endpointDraft, setEndpointDraft] = useState(settings.endpoint);
    const normalizedEndpoint = normalizeLocalEndpoint(endpointDraft);
    const endpointChanged = normalizedEndpoint !== null && normalizedEndpoint !== settings.endpoint;
    const endpointValid = isAllowedLocalEndpoint(endpointDraft);

    useEffect(() => {
        setEndpointDraft(settings.endpoint);
    }, [settings.endpoint]);

    const saveEndpoint = () => {
        if (!normalizedEndpoint) return;
        onChange({ endpoint: normalizedEndpoint });
    };

    const themeOptions: { value: ThemeMode; label: string }[] = [
        { value: "system", label: "Auto" },
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl space-y-7 p-5 sm:p-6">
                <header>
                    <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Stored locally in this browser. No prompt or response telemetry is
                        collected.
                    </p>
                </header>

                <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
                    <div>
                        <h3 className="text-base font-semibold">Appearance</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Auto follows your browser or operating-system color preference.
                        </p>
                    </div>
                    <Label id="theme-label">Theme</Label>
                    <div
                        className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-surface-secondary p-1"
                        role="radiogroup"
                        aria-labelledby="theme-label"
                    >
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={settings.theme === option.value}
                                onClick={() => onChange({ theme: option.value })}
                                className={`h-9 rounded-md px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                    settings.theme === option.value
                                        ? "bg-background text-foreground shadow-subtle"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="space-y-4 rounded-xl border border-border bg-surface p-4">
                    <div>
                        <h3 className="text-base font-semibold">Model</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Connect to a loopback Ollama runtime and choose an installed model.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endpoint">Local endpoint</Label>
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
                        <p className="text-xs text-muted-foreground">
                            Loopback only. Use http://localhost:&lt;port&gt; or
                            http://127.0.0.1:&lt;port&gt;.
                        </p>
                        {!endpointValid ? (
                            <p className="text-xs text-destructive">
                                Remote, HTTPS, LAN, path, query, and credentialed endpoints are
                                blocked.
                            </p>
                        ) : null}
                        {endpointChanged ? (
                            <Button variant="secondary" size="sm" onClick={saveEndpoint}>
                                Save endpoint
                            </Button>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <select
                            id="model"
                            value={settings.selectedModel ?? ""}
                            onChange={(e) => onChange({ selectedModel: e.target.value })}
                            className="h-10 w-full truncate rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {models.length === 0 ? (
                                <option value="">no models discovered</option>
                            ) : null}
                            {models.map((m) => (
                                <option key={m.name} value={m.name}>
                                    {m.name}
                                    {m.parameterSize ? ` · ${m.parameterSize}` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="system">System prompt</Label>
                        <Textarea
                            id="system"
                            rows={4}
                            placeholder="Optional instructions prepended to every conversation."
                            value={settings.systemPrompt}
                            onChange={(e) => onChange({ systemPrompt: e.target.value })}
                        />
                    </div>
                </section>

                <section className="space-y-5 rounded-xl border border-border bg-surface p-4">
                    <div>
                        <h3 className="text-base font-semibold">Generation</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Tune response style and how much local chat context is sent.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Temperature</Label>
                            <span className="font-mono text-xs text-muted-foreground">
                                {settings.temperature.toFixed(2)}
                            </span>
                        </div>
                        <Slider
                            aria-label="Temperature"
                            value={[settings.temperature]}
                            min={0}
                            max={1.5}
                            step={0.05}
                            onValueChange={([v]) => onChange({ temperature: v ?? 0.7 })}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>History depth sent to the model</Label>
                            <span className="font-mono text-xs text-muted-foreground">
                                {settings.historyLimit} msgs
                            </span>
                        </div>
                        <Slider
                            aria-label="History depth sent to the model"
                            value={[settings.historyLimit]}
                            min={2}
                            max={60}
                            step={2}
                            onValueChange={([v]) => onChange({ historyLimit: v ?? 20 })}
                        />
                    </div>
                </section>

                <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
                    <h3 className="text-base font-semibold">Data</h3>
                    <p className="text-xs text-muted-foreground">
                        Conversations live in this browser&apos;s IndexedDB and are retained until
                        you delete them.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={onExport}>
                            <Download className="size-4" /> Export JSON
                        </Button>
                        <Button variant="destructive" size="sm" onClick={onClearAll}>
                            <Trash2 className="size-4" /> Clear all history
                        </Button>
                    </div>
                </section>

                <section className="space-y-2 rounded-xl border border-border bg-surface p-4">
                    <h3 className="text-base font-semibold">Runtime</h3>
                    <p className="text-sm text-muted-foreground">
                        Ollama requests stay on the configured loopback endpoint.
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                        {settings.endpoint}
                    </p>
                </section>
            </div>
        </div>
    );
}
