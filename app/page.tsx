"use client";

import { useCallback, useMemo, useState } from "react";
import { EdgeButton } from "@/components/ui/edge-button";
import { useTheme } from "@/components/providers/theme-provider";
import { useResource } from "@/hooks/useResource";
import type { Template } from "@/data/templates";
import type { Model } from "@/data/models";
import { cn } from "@/lib/cn";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  status?: "streaming" | "done";
};

const initialMessages: ChatMessage[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    content:
      "Welcome to Lumen Studio. Pick a template, choose a model, and I will stitch the beats into a ship-ready narrative.",
    model: "Lumen Edge",
    status: "done",
  },
  {
    id: "user-brief",
    role: "user",
    content:
      "Summarize the upcoming release for product marketing with three differentiators.",
  },
  {
    id: "assistant-brief",
    role: "assistant",
    content:
      "Drafted a hero narrative, risk callouts, and CTA tailored for product marketing. Ready for refinement or export.",
    model: "GPT-4.1",
    status: "done",
  },
];

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const synthesizeResponse = (
  prompt: string,
  modelName?: string,
  tone?: string,
  options?: { temperature: number; maxTokens: number },
) => {
  return [
    `(${modelName ?? "Studio Model"}) ${tone ?? "Product"} tone:`,
    `• Insight hook tying the ask back to measurable impact.`,
    `• Rationale grounded in customer signal and upcoming milestones.`,
    `• CTA nudging next-step commitment.`,
    "",
    `Stack parameters → Temp ${options?.temperature.toFixed(1) ?? "0.7"} · Max ${options?.maxTokens ?? 800} tokens`,
    "",
    `Prompt referenced: “${prompt.slice(0, 140)}${prompt.length > 140 ? "…" : ""}”`,
  ].join("\n");
};

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const {
    data: templateData,
    loading: templatesLoading,
    error: templateError,
  } = useResource<Template[]>("/api/templates");
  const {
    data: modelData,
    loading: modelsLoading,
    error: modelError,
  } = useResource<Model[]>("/api/models");

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [selectedModelId, setSelectedModelId] = useState<string>("gpt-4.1");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(800);
  const [customModels, setCustomModels] = useState<Model[]>([]);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [newModelProvider, setNewModelProvider] =
    useState<Model["provider"]>("Custom");
  const [newModelTokens, setNewModelTokens] = useState(48000);
  const [newModelLatency, setNewModelLatency] = useState(950);
  const [newModelMaxTokens, setNewModelMaxTokens] = useState(64000);
  const [newModelStrengths, setNewModelStrengths] = useState("Brand-safe · On-device");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const allModels = useMemo(
    () => [...(modelData ?? []), ...customModels],
    [modelData, customModels],
  );

  const activeModel = useMemo(
    () => allModels.find((model) => model.id === selectedModelId) ?? allModels[0],
    [allModels, selectedModelId],
  );

  const handleTemplateSelect = useCallback(
    (template: Template) => {
      setSelectedTemplateId(template.id);
      setChatInput(template.prompt);
    },
    [setChatInput],
  );

  const handlePromptSubmit = useCallback(() => {
    const trimmed = chatInput.trim();
    if (!trimmed || isThinking) return;

    const templateTone = templateData?.find(
      (template) => template.id === selectedTemplateId,
    )?.tone;

    const userMessage: ChatMessage = {
      id: createId("user"),
      role: "user",
      content: trimmed,
    };

    const responseId = createId("assistant");
    const placeholder: ChatMessage = {
      id: responseId,
      role: "assistant",
      content: "Synthesizing answer…",
      model: activeModel?.name,
      status: "streaming",
    };

    setMessages((prev) => [...prev, userMessage, placeholder]);
    setChatInput("");
    setIsThinking(true);

    const delay = activeModel ? activeModel.latencyMs : 900;

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === responseId
            ? {
                ...message,
                content: synthesizeResponse(trimmed, activeModel?.name, templateTone, {
                  temperature,
                  maxTokens,
                }),
                status: "done",
              }
            : message,
        ),
      );
      setIsThinking(false);
    }, Math.min(delay, 2000));
  }, [
    chatInput,
    isThinking,
    activeModel,
    templateData,
    selectedTemplateId,
    temperature,
    maxTokens,
  ]);

  const handleCopy = useCallback((message: ChatMessage) => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(message.content).then(() => {
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 1400);
    });
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "lumen-session.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,198,167,0.4),_transparent_55%),radial-gradient(circle_at_20%_20%,_rgba(255,247,233,.8),_transparent_45%)] px-4 py-8 text-sm text-[#1c1b1f] dark:bg-[radial-gradient(circle_at_top,_rgba(255,139,77,0.2),_rgba(5,5,5,1)_65%)] md:px-10 lg:px-16">
      <header className="rounded-3xl border border-black/5 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#ff8455]">
              Lumen AI Studio
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#1f1f1f] dark:text-white">
              Design messaging with trustworthy model context.
            </h1>
            <p className="mt-2 text-base text-[#4b4b4b] dark:text-[#c9ced6]">
              Compare models, remix templates, and export ready-to-ship chat
              scripts in one responsive workspace.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <EdgeButton
              aria-label="Toggle theme"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <SunIcon className="size-5" />
              ) : (
                <MoonIcon className="size-5" />
              )}
            </EdgeButton>
            <EdgeButton variant="outline">View research log</EdgeButton>
            <EdgeButton>Ship to prod</EdgeButton>
          </div>
        </div>
      </header>

      <main className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="rounded-3xl border border-black/5 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#ff8455]">
                Templates
              </p>
              <h2 className="text-lg font-semibold">Prompt systems</h2>
            </div>
            <span className="rounded-full bg-[#ffe6d3] px-3 py-1 text-xs font-medium text-[#c04b1c] dark:bg-white/10 dark:text-white">
              {templateData?.length ?? 0} ready
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {templatesLoading && (
              <>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="h-28 animate-pulse rounded-2xl border border-dashed border-black/10 bg-white/40 dark:border-white/10"
                  />
                ))}
              </>
            )}
            {templateError && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
                Unable to load templates. Refresh to retry.
              </p>
            )}
            {templateData?.map((template) => {
              const isActive = selectedTemplateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa87a]",
                    isActive
                      ? "border-[#ffb18d] bg-[#fff3eb]"
                      : "border-black/5 bg-white/70 dark:border-white/10 dark:bg-white/10",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-black/80 px-2 py-0.5 text-xs text-white dark:bg-white/70 dark:text-[#111]">
                      {template.tone}
                    </span>
                    <span className="text-xs text-[#5d5d5d] dark:text-[#b5bcc7]">
                      {template.audience}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{template.title}</h3>
                  <p className="mt-1 text-sm text-[#5d5d5d] dark:text-[#cdd2db]">
                    {template.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-col rounded-3xl border border-black/5 bg-white/90 p-5 backdrop-blur dark:border-white/10 dark:bg-white/10">
          <header className="flex flex-wrap items-center gap-3 border-b border-dashed border-black/10 pb-4 dark:border-white/10">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#ff8455]">
                Chat orchestration
              </p>
              <h2 className="text-2xl font-semibold">Session timeline</h2>
            </div>
            <div className="ml-auto flex gap-2">
              <EdgeButton
                type="button"
                variant="ghost"
                className="text-xs"
                onClick={handleDownload}
              >
                Download JSON
              </EdgeButton>
            </div>
          </header>

          <ol className="mt-4 flex-1 space-y-4 overflow-y-auto pr-2">
            {messages.map((message) => (
              <li
                key={message.id}
                className={cn(
                  "group relative rounded-2xl border p-4",
                  message.role === "assistant"
                    ? "border-[#ffd4bd] bg-[#fff8f4] dark:border-white/10 dark:bg-white/5"
                    : "border-black/5 bg-white dark:border-white/10 dark:bg-white/10",
                )}
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#a47662] dark:text-[#f7c0a3]">
                  {message.role === "assistant" ? "Assistant" : "You"}
                  {message.model && (
                    <span className="rounded-full bg-black/80 px-2 py-0.5 text-[0.6rem] font-semibold text-white dark:bg-white/20">
                      {message.model}
                    </span>
                  )}
                  {message.status === "streaming" && (
                    <span className="text-[0.6rem] text-[#ff8455]" aria-live="polite">
                      streaming
                    </span>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-[#1d1d1f] dark:text-[#f4f5f7]">
                  {message.content}
                </p>
                {message.role === "assistant" && (
                  <div className="mt-3 flex gap-2">
                    <EdgeButton
                      type="button"
                      size="md"
                      variant="ghost"
                      onClick={() => handleCopy(message)}
                    >
                      {copiedMessageId === message.id ? "Copied" : "Copy"}
                    </EdgeButton>
                    <EdgeButton
                      type="button"
                      size="md"
                      variant="ghost"
                      onClick={handleDownload}
                    >
                      Export
                    </EdgeButton>
                  </div>
                )}
              </li>
            ))}
          </ol>

          <form
            className="mt-4 flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
            onSubmit={(event) => {
              event.preventDefault();
              handlePromptSubmit();
            }}
          >
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a5a1a1]">
              Brief or follow-up
            </label>
            <textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Draft a teaser for Lumen Edge with optional CTA..."
              className="min-h-[96px] resize-none rounded-2xl border border-dashed border-black/15 bg-transparent p-3 text-base text-[#1c1c1c] outline-none transition focus:border-[#ffa87a] dark:border-white/25 dark:text-white"
              aria-label="Chat prompt"
            />
            <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="grid gap-3 md:grid-cols-2">
                <fieldset>
                  <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a5a1a1]">
                    Temperature
                  </legend>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(event) => setTemperature(Number(event.target.value))}
                    className="w-full accent-[#ff8455]"
                    aria-valuemin={0}
                    aria-valuemax={1}
                    aria-valuenow={temperature}
                    aria-label="Adjust temperature"
                  />
                  <p className="text-sm text-[#555] dark:text-[#cdd0d8]">
                    {temperature.toFixed(1)} · lower = safer, higher = riskier narratives
                  </p>
                </fieldset>
                <fieldset>
                  <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a5a1a1]">
                    Max tokens
                  </legend>
                  <input
                    type="range"
                    min={200}
                    max={2000}
                    step={100}
                    value={maxTokens}
                    onChange={(event) => setMaxTokens(Number(event.target.value))}
                    className="w-full accent-[#ff8455]"
                    aria-valuemin={200}
                    aria-valuemax={2000}
                    aria-valuenow={maxTokens}
                    aria-label="Adjust maximum tokens"
                  />
                  <p className="text-sm text-[#555] dark:text-[#cdd0d8]">
                    {maxTokens} tokens budget
                  </p>
                </fieldset>
              </div>
              <div className="rounded-2xl border border-dashed border-black/10 p-3 dark:border-white/15">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a5a1a1]">
                      Custom model
                    </p>
                    <p className="text-sm text-[#5c5c5c] dark:text-[#cdd0d8]">
                      Inject your own deployment into the dropdown.
                    </p>
                  </div>
                  <EdgeButton
                    type="button"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setIsAddingModel((prev) => !prev)}
                  >
                    {isAddingModel ? "Close" : "Add model"}
                  </EdgeButton>
                </div>
                {isAddingModel && (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                      Name
                      <input
                        className="mt-1 w-full rounded-xl border border-black/15 bg-white/80 p-2 text-sm dark:border-white/20 dark:bg-white/10"
                        value={newModelName}
                        onChange={(event) => setNewModelName(event.target.value)}
                        placeholder="e.g., Lumen Edge Turbo"
                      />
                    </label>
                    <label className="text-sm">
                      Provider
                      <select
                        className="mt-1 w-full rounded-xl border border-black/15 bg-white/80 p-2 text-sm dark:border-white/20 dark:bg-white/10"
                        value={newModelProvider}
                        onChange={(event) =>
                          setNewModelProvider(event.target.value as Model["provider"])
                        }
                      >
                        <option value="Custom">Custom</option>
                        <option value="OpenAI">OpenAI</option>
                        <option value="Anthropic">Anthropic</option>
                        <option value="Meta">Meta</option>
                      </select>
                    </label>
                    <label className="text-sm">
                      Tokens / min
                      <input
                        type="number"
                        min={1000}
                        className="mt-1 w-full rounded-xl border border-black/15 bg-white/80 p-2 text-sm dark:border-white/20 dark:bg-white/10"
                        value={newModelTokens}
                        onChange={(event) => setNewModelTokens(Number(event.target.value))}
                      />
                    </label>
                    <label className="text-sm">
                      Latency (ms)
                      <input
                        type="number"
                        min={100}
                        className="mt-1 w-full rounded-xl border border-black/15 bg-white/80 p-2 text-sm dark:border-white/20 dark:bg-white/10"
                        value={newModelLatency}
                        onChange={(event) => setNewModelLatency(Number(event.target.value))}
                      />
                    </label>
                    <label className="text-sm">
                      Max tokens
                      <input
                        type="number"
                        min={1000}
                        className="mt-1 w-full rounded-xl border border-black/15 bg-white/80 p-2 text-sm dark:border-white/20 dark:bg-white/10"
                        value={newModelMaxTokens}
                        onChange={(event) => setNewModelMaxTokens(Number(event.target.value))}
                      />
                    </label>
                    <label className="text-sm md:col-span-2">
                      Strengths (comma separated)
                      <input
                        className="mt-1 w-full rounded-xl border border-black/15 bg-white/80 p-2 text-sm dark:border-white/20 dark:bg-white/10"
                        value={newModelStrengths}
                        onChange={(event) => setNewModelStrengths(event.target.value)}
                        placeholder="Grounded answers, Works offline"
                      />
                    </label>
                    <EdgeButton
                      type="button"
                      className="md:col-span-2"
                      onClick={() => {
                        if (!newModelName.trim()) return;
                        const id = createId("custom-model");
                        const strengths = newModelStrengths
                          .split(",")
                          .map((strength) => strength.trim())
                          .filter(Boolean);
                        setCustomModels((prev) => [
                          ...prev,
                          {
                            id,
                            name: newModelName.trim(),
                            provider: (newModelProvider || "Custom") as Model["provider"],
                            tokensPerMin: newModelTokens,
                            latencyMs: newModelLatency,
                            maxTokens: newModelMaxTokens,
                            strengths: strengths.length ? strengths : ["User supplied tuning"],
                          },
                        ]);
                        setSelectedModelId(id);
                        setNewModelName("");
                        setNewModelStrengths("Brand-safe · On-device");
                        setIsAddingModel(false);
                      }}
                    >
                      Save & use model
                    </EdgeButton>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <EdgeButton
                type="submit"
                disabled={isThinking}
                className="flex-1"
              >
                {isThinking ? "Synthesizing…" : "Run prompt"}
              </EdgeButton>
              <select
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/15 dark:bg-white/10"
                value={selectedModelId}
                onChange={(event) => setSelectedModelId(event.target.value)}
                aria-label="Select model"
              >
                {allModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </section>

        <aside className="rounded-3xl border border-black/5 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#ff8455]">
                Model desk
              </p>
              <h2 className="text-lg font-semibold">Comparisons</h2>
            </div>
            <span className="text-xs text-[#6f6f6f] dark:text-[#c6ccd5]">
              {modelsLoading ? "loading" : "live"}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {modelsLoading && (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`model-skeleton-${index}`}
                    className="h-28 animate-pulse rounded-2xl border border-dashed border-black/15 bg-white/40"
                  />
                ))}
              </>
            )}
            {modelError && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
                Cannot fetch models right now.
              </p>
            )}
            {modelData?.map((model) => {
              const isActive = activeModel?.id === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModelId(model.id)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa87a]",
                    isActive
                      ? "border-[#ffb18d] bg-[#fff3eb]"
                      : "border-black/5 bg-white dark:border-white/10 dark:bg-white/10",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{model.name}</h3>
                    <span className="text-xs text-[#6d6d6d] dark:text-[#b9bfc8]">
                      {model.provider}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#5c5b5b] dark:text-[#c3c9d3]">
                    <div className="rounded-xl bg-[#fff9f5] p-2 dark:bg-white/5">
                      <dt className="font-semibold uppercase tracking-widest text-[0.6rem] text-[#ff8455]">
                        Tokens / min
                      </dt>
                      <dd className="text-base font-semibold text-[#1d1c1e] dark:text-white">
                        {Intl.NumberFormat("en-US").format(model.tokensPerMin)}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-[#fff9f5] p-2 dark:bg-white/5">
                      <dt className="font-semibold uppercase tracking-widest text-[0.6rem] text-[#ff8455]">
                        Latency
                      </dt>
                      <dd className="text-base font-semibold text-[#1d1c1e] dark:text-white">
                        {model.latencyMs} ms
                      </dd>
                    </div>
                    <div className="col-span-2 rounded-xl bg-[#fcf5ff] p-2 dark:bg-white/5">
                      <dt className="font-semibold uppercase tracking-widest text-[0.6rem] text-[#9c6ee6]">
                        Strengths
                      </dt>
                      <dd className="mt-1 text-sm">
                        {model.strengths.join(" · ")}
                      </dd>
                    </div>
                  </dl>
                </button>
              );
            })}
          </div>
        </aside>
      </main>
    </div>
  );
}

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
      <path d="M12 3v2m0 14v2M5 5l1.5 1.5M17.5 17.5 19 19M3 12h2m14 0h2M5 19l1.5-1.5M17.5 6.5 19 5" strokeWidth="1.5" />
    </svg>
  );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
        strokeWidth="1.5"
      />
    </svg>
  );
}
