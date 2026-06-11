export const FPS = 30;

export const theme = {
  bg: "#0b0d12",
  bgPanel: "#11141d",
  bgCode: "#0d1017",
  stroke: "#252b3d",
  text: "#e9edf5",
  textDim: "#8b94aa",
  accent: "#8b5cf6",
  accent2: "#22d3ee",
  green: "#34d399",
  red: "#fb7185",
  amber: "#fbbf24",
  grey: "#7a8194",
  fontDisplay: "'Avenir Next', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontMono: "'SF Mono', Menlo, 'Cascadia Code', Consolas, monospace",
} as const;

export type Severity = "blocking" | "warn" | "nit";

export const severityColor: Record<Severity, string> = {
  blocking: theme.red,
  warn: theme.amber,
  nit: theme.grey,
};

export const severityLabel: Record<Severity, string> = {
  blocking: "BLOCKING",
  warn: "WORTH A LOOK",
  nit: "NIT",
};
