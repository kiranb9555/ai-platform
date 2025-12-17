export type Model = {
  id: string;
  name: string;
  provider: "OpenAI" | "Anthropic" | "Meta" | "Custom";
  tokensPerMin: number;
  latencyMs: number;
  maxTokens: number;
  strengths: string[];
};

export const models: Model[] = [
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    tokensPerMin: 90000,
    latencyMs: 1800,
    maxTokens: 128000,
    strengths: [
      "Reasoning heavy analysis",
      "Multimodal synthesis",
      "Best for strategic planning",
    ],
  },
  {
    id: "sonnet-3.5",
    name: "Claude Sonnet 3.5",
    provider: "Anthropic",
    tokensPerMin: 60000,
    latencyMs: 1500,
    maxTokens: 200000,
    strengths: [
      "Fast creative writing",
      "Great follow-up questions",
      "Low hallucination rate",
    ],
  },
  {
    id: "lumen-edge",
    name: "Lumen Edge",
    provider: "Custom",
    tokensPerMin: 45000,
    latencyMs: 800,
    maxTokens: 64000,
    strengths: [
      "Edge deployment",
      "Knowledge-grounded answers",
      "Streaming ready",
    ],
  },
  {
    id: "llama-3.2",
    name: "Llama 3.2",
    provider: "Meta",
    tokensPerMin: 30000,
    latencyMs: 1200,
    maxTokens: 32000,
    strengths: [
      "Great for multilingual UX",
      "Open weights compliant",
      "Excellent for experimentation",
    ],
  },
];
