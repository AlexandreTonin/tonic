import type { FretRole } from "@/lib/theory/core";

export const DOT_STYLE: Record<
  FretRole,
  { fill: string; stroke?: string; text: string }
> = {
  root: { fill: "var(--fret-root)", text: "var(--highlight-foreground)" },
  "chord-tone": { fill: "var(--fret-chord-tone)", text: "var(--background)" },
  "scale-tone": {
    fill: "var(--background)",
    stroke: "var(--fret-scale-tone)",
    text: "var(--foreground)",
  },
  outside: { fill: "var(--fret-outside)", text: "var(--muted-foreground)" },
};
