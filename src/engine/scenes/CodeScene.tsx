import React from "react";
import { useCurrentFrame } from "remotion";
import { CodeBlock, type LineRange } from "../code/CodeBlock";
import type { CodeLang } from "../code/highlight";
import { FPS, theme } from "../theme";
import { CalloutOverlay, type Finding } from "./CalloutOverlay";
import { FileChip, Panel, SceneShell } from "./SceneShell";

export type SpotlightBeat = {
  readonly atSecond: number;
  readonly lines: readonly LineRange[];
  readonly label?: string;
};

export type TreeLine = {
  readonly text: string;
  readonly depth: number;
  readonly highlight?: boolean;
  readonly note?: string;
};

const TreePanel: React.FC<{ label: string; lines: readonly TreeLine[] }> = ({ label, lines }) => (
  <div
    style={{
      backgroundColor: theme.bgPanel,
      border: `1px solid ${theme.stroke}`,
      borderRadius: 16,
      padding: "26px 30px",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        fontFamily: theme.fontDisplay,
        fontWeight: 600,
        fontSize: 21,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: theme.textDim,
        marginBottom: 16,
      }}
    >
      {label}
    </div>
    {lines.map((line, i) => (
      <div
        key={i}
        style={{
          fontFamily: theme.fontMono,
          fontSize: 23,
          lineHeight: 1.7,
          paddingLeft: line.depth * 26,
          color: line.highlight ? theme.accent2 : theme.textDim,
          fontWeight: line.highlight ? 700 : 400,
          whiteSpace: "nowrap",
        }}
      >
        {line.depth > 0 && <span style={{ opacity: 0.5 }}>└─ </span>}
        {line.text}
        {line.highlight && <span> ←</span>}
        {line.note && (
          <span style={{ fontFamily: theme.fontDisplay, fontSize: 19, color: theme.amber, marginLeft: 12 }}>
            {line.note}
          </span>
        )}
      </div>
    ))}
  </div>
);

export const CodeScene: React.FC<{
  kicker?: string;
  title?: string;
  file?: string;
  badge?: string;
  badgeColor?: string;
  contextTag?: boolean;
  code: string;
  lang?: CodeLang;
  fontSize?: number;
  startLineNumber?: number;
  showLineNumbers?: boolean;
  spotlights?: readonly SpotlightBeat[];
  finding?: Finding;
  highlightColor?: string;
  tree?: readonly TreeLine[];
  treeLabel?: string;
}> = ({
  kicker,
  title,
  file,
  badge,
  badgeColor,
  contextTag,
  code,
  lang,
  fontSize,
  startLineNumber,
  showLineNumbers,
  spotlights = [],
  finding,
  highlightColor,
  tree,
  treeLabel = "where this lives",
}) => {
  const frame = useCurrentFrame();
  const second = frame / FPS;
  const active = [...spotlights].reverse().find((beat) => second >= beat.atSecond);
  return (
    <SceneShell kicker={kicker} title={title} contextTag={contextTag} center>
      <div style={{ display: "flex", gap: 36, alignItems: "center", maxWidth: "100%" }}>
        {tree && <TreePanel label={treeLabel} lines={tree} />}
        <Panel>
        {file && <FileChip path={file} badge={badge} badgeColor={badgeColor} />}
        <CodeBlock
          code={code}
          lang={lang}
          fontSize={fontSize}
          startLineNumber={startLineNumber}
          showLineNumbers={showLineNumbers}
          spotlight={active?.lines ?? []}
          highlightColor={highlightColor}
        />
        {active?.label && (
          <div
            style={{
              marginTop: 24,
              fontFamily: theme.fontDisplay,
              fontWeight: 600,
              fontSize: 28,
              color: theme.accent2,
            }}
          >
            ↑ {active.label}
          </div>
        )}
        </Panel>
      </div>
      {finding && <CalloutOverlay finding={finding} />}
    </SceneShell>
  );
};
