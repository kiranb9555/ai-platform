export type Template = {
  id: string;
  title: string;
  summary: string;
  tone: "Analytical" | "Playful" | "Educational" | "Product";
  audience: string;
  prompt: string;
};

export const templates: Template[] = [
  {
    id: "competitive-brief",
    title: "Competitive Brief",
    summary:
      "Compares two products and spots strategic risks in under 5 bullets.",
    tone: "Analytical",
    audience: "Product leadership",
    prompt:
      "Analyze the two offerings, surface differentiators, and highlight risks that demand immediate attention.",
  },
  {
    id: "launch-email",
    title: "Launch Email",
    summary:
      "Announces a new capability with clear CTA + success metrics customers care about.",
    tone: "Product",
    audience: "Existing customers",
    prompt:
      "Draft a crisp launch email that introduces the capability, includes an insight-led hook, outlines 2-3 benefits, and ends with a strong CTA.",
  },
  {
    id: "learning-snippet",
    title: "Learning Snippet",
    summary:
      "Turns dense release notes into a 90-second micro-lesson with an inviting tone.",
    tone: "Educational",
    audience: "Internal enablement",
    prompt:
      "Convert the notes into an engaging script with a metaphor, numbered steps, and a memorable closing line.",
  },
  {
    id: "social-teaser",
    title: "Social Teaser",
    summary:
      "Hooky LinkedIn teaser that drives curiosity without sounding like a press release.",
    tone: "Playful",
    audience: "Public Linkedin",
    prompt:
      "Write a short teaser that starts with a bold observation, ties it to the release, and ends with an invitation to comment.",
  },
];
