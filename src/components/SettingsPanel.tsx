import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { isAllowedLocalEndpoint, normalizeLocalEndpoint } from "@/lib/local-endpoint";
import type { LocalModel, Settings } from "@/lib/types";

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

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl space-y-8 p-6">
                <header>
                    <h2 className="text-lg font-semibold">Settings</h2>
                    <p className="text-sm text-muted-foreground">
                        Stored locally in this browser. No prompt or response telemetry is
                        collected.
                    </p>
                </header>

                <section className="space-y-2">
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
                            Remote, HTTPS, LAN, path, query, and credentialed endpoints are blocked.
                        </p>
                    ) : null}
                    {endpointChanged ? (
                        <Button variant="secondary" size="sm" onClick={saveEndpoint}>
                            Save endpoint
                        </Button>
                    ) : null}
                </section>

                <section className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <select
                        id="model"
                        value={settings.selectedModel ?? ""}
                        onChange={(e) => onChange({ selectedModel: e.target.value })}
                        className="h-9 w-full rounded-md border border-input bg-surface px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                </section>

                <section className="space-y-2">
                    <Label htmlFor="system">System prompt</Label>
                    <Textarea
                        id="system"
                        rows={4}
                        placeholder="Optional instructions prepended to every conversation."
                        value={settings.systemPrompt}
                        onChange={(e) => onChange({ systemPrompt: e.target.value })}
                    />
                </section>

                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Temperature</Label>
                        <span className="tag-mono text-primary">
                            {settings.temperature.toFixed(2)}
                        </span>
                    </div>
                    <Slider
                        value={[settings.temperature]}
                        min={0}
                        max={1.5}
                        step={0.05}
                        onValueChange={([v]) => onChange({ temperature: v ?? 0.7 })}
                    />
                </section>

                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>History depth sent to the model</Label>
                        <span className="tag-mono text-primary">{settings.historyLimit} msgs</span>
                    </div>
                    <Slider
                        value={[settings.historyLimit]}
                        min={2}
                        max={60}
                        step={2}
                        onValueChange={([v]) => onChange({ historyLimit: v ?? 20 })}
                    />
                </section>

                <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
                    <h3 className="text-sm font-semibold">Local data</h3>
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
            </div>
        </div>
    );
}
