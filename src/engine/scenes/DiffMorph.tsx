import { diffLines } from "diff";
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CodeLine } from "../code/CodeBlock";
import { useTokenLines, type CodeLang } from "../code/highlight";
import { FPS, theme } from "../theme";
import { FileChip, Panel, SceneShell } from "./SceneShell";

type Row = {
  kind: "same" | "add" | "del";
  beforeLine?: number;
  afterLine?: number;
};

function computeRows(before: string, after: string): Row[] {
  const rows: Row[] = [];
  let beforeLine = 0;
  let afterLine = 0;
  for (const part of diffLines(before.replace(/\n$/, "") + "\n", after.replace(/\n$/, "") + "\n")) {
    const count = part.count ?? 0;
    for (let i = 0; i < count; i++) {
      if (part.added) {
        rows.push({ kind: "add", afterLine: afterLine++ });
      } else if (part.removed) {
        rows.push({ kind: "del", beforeLine: beforeLine++ });
      } else {
        rows.push({ kind: "same", beforeLine: beforeLine++, afterLine: afterLine++ });
      }
    }
  }
  return rows;
}

export const DiffMorph: React.FC<{
  kicker?: string;
  title?: string;
  file?: string;
  before: string;
  after: string;
  lang?: CodeLang;
  fontSize?: number;
  morphAtSecond: number;
}> = ({ kicker, title, file, before, after, lang = "typescript", fontSize = 30, morphAtSecond }) => {
  const frame = useCurrentFrame();
  const beforeTokens = useTokenLines(before.replace(/\n$/, ""), lang);
  const afterTokens = useTokenLines(after.replace(/\n$/, ""), lang);
  if (!beforeTokens || !afterTokens) return null;
  const rows = computeRows(before, after);
  const lineHeight = fontSize * 1.55;
  const morphStart = morphAtSecond * FPS;
  const morph = interpolate(frame, [morphStart, morphStart + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flashFade = interpolate(frame, [morphStart + 22, morphStart + 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <SceneShell kicker={kicker} title={title} center>
      <Panel>
        {file && (
          <FileChip
            path={file}
            badge={morph > 0.5 ? "after" : "before"}
            badgeColor={morph > 0.5 ? theme.green : theme.red}
          />
        )}
        <div style={{ fontFamily: theme.fontMono, fontSize, lineHeight: `${lineHeight}px` }}>
          {rows.map((row, i) => {
            const tokens =
              row.kind === "del" ? beforeTokens[row.beforeLine!] : afterTokens[row.afterLine!];
            const height =
              row.kind === "same" ? lineHeight : row.kind === "del" ? lineHeight * (1 - morph) : lineHeight * morph;
            const opacity = row.kind === "same" ? 1 : row.kind === "del" ? 1 - morph : morph;
            const flash =
              row.kind === "add" && morph > 0
                ? `${theme.green}${alphaHex(0.16 * flashFade + 0.06 * morph)}`
                : row.kind === "del"
                  ? `${theme.red}${alphaHex(0.14 * (1 - morph) + 0.04)}`
                  : "transparent";
            return (
              <div
                key={i}
                style={{
                  height,
                  opacity,
                  overflow: "hidden",
                  backgroundColor: flash,
                  borderRadius: 4,
                  paddingLeft: 12,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ width: fontSize * 1.2, color: rowGlyphColor(row.kind), flexShrink: 0 }}>
                  {row.kind === "add" ? "+" : row.kind === "del" ? "-" : " "}
                </span>
                {tokens && <CodeLine tokens={tokens} />}
              </div>
            );
          })}
        </div>
      </Panel>
    </SceneShell>
  );
};

const rowGlyphColor = (kind: Row["kind"]): string =>
  kind === "add" ? theme.green : kind === "del" ? theme.red : "transparent";

const alphaHex = (alpha: number): string =>
  Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
