import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FPS, theme } from "../theme";
import { useTokenLines, type CodeLang, type TokenLine } from "./highlight";

export type LineRange = readonly [number, number];

const lineInRanges = (lineNumber: number, ranges: readonly LineRange[]): boolean =>
  ranges.some(([start, end]) => lineNumber >= start && lineNumber <= end);

export const CodeBlock: React.FC<{
  code: string;
  lang?: CodeLang;
  fontSize?: number;
  startLineNumber?: number;
  showLineNumbers?: boolean;
  spotlight?: readonly LineRange[];
  revealAtSecond?: number;
  highlightColor?: string;
}> = ({
  code,
  lang = "typescript",
  fontSize = 30,
  startLineNumber = 1,
  showLineNumbers = true,
  spotlight = [],
  revealAtSecond = 0,
  highlightColor = theme.accent,
}) => {
  const frame = useCurrentFrame();
  const lines = useTokenLines(code.replace(/\n$/, ""), lang);
  if (!lines) return null;
  const lineHeight = fontSize * 1.55;
  const hasSpotlight = spotlight.length > 0;
  return (
    <div style={{ fontFamily: theme.fontMono, fontSize, lineHeight: `${lineHeight}px` }}>
      {lines.map((tokens, i) => {
        const lineNumber = startLineNumber + i;
        const revealFrame = revealAtSecond * FPS + i * 1.2;
        const appear = interpolate(frame, [revealFrame, revealFrame + 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const lit = !hasSpotlight || lineInRanges(lineNumber, spotlight);
        const opacity = appear * (lit ? 1 : 0.22);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              opacity,
              transform: `translateX(${(1 - appear) * 24}px)`,
              backgroundColor: lit && hasSpotlight ? `${highlightColor}1f` : "transparent",
              borderLeft: lit && hasSpotlight ? `4px solid ${highlightColor}` : "4px solid transparent",
              paddingLeft: 14,
              borderRadius: 4,
            }}
          >
            {showLineNumbers && (
              <span
                style={{
                  width: fontSize * 1.8,
                  flexShrink: 0,
                  textAlign: "right",
                  marginRight: fontSize * 0.9,
                  color: theme.textDim,
                  opacity: 0.55,
                  userSelect: "none",
                }}
              >
                {lineNumber}
              </span>
            )}
            <CodeLine tokens={tokens} />
          </div>
        );
      })}
    </div>
  );
};

export const CodeLine: React.FC<{ tokens: TokenLine }> = ({ tokens }) => (
  <span style={{ whiteSpace: "pre" }}>
    {tokens.length === 0 ? " " : tokens.map((token, i) => (
      <span key={i} style={{ color: token.color ?? theme.text }}>
        {token.content}
      </span>
    ))}
  </span>
);
