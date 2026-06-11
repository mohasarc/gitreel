import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FPS, theme } from "../theme";
import { Panel, SceneShell } from "./SceneShell";

export const TerminalScene: React.FC<{
  kicker?: string;
  title?: string;
  command: string;
  output: string;
  fontSize?: number;
  outputAtSecond?: number;
  highlightPattern?: RegExp;
}> = ({ kicker, title, command, output, fontSize = 30, outputAtSecond = 0.8, highlightPattern }) => {
  const frame = useCurrentFrame();
  const typedChars = Math.floor(interpolate(frame, [4, outputAtSecond * FPS - 4], [0, command.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const outputLines = output.replace(/\n$/, "").split("\n");
  return (
    <SceneShell kicker={kicker} title={title} center>
      <Panel padding={0}>
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "18px 24px",
            borderBottom: `1px solid ${theme.stroke}`,
            alignItems: "center",
          }}
        >
          {[theme.red, theme.amber, theme.green].map((color, i) => (
            <span key={i} style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: color }} />
          ))}
          <span style={{ fontFamily: theme.fontMono, fontSize: 22, color: theme.textDim, marginLeft: 14 }}>
            terminal
          </span>
        </div>
        <div style={{ padding: 36, fontFamily: theme.fontMono, fontSize, lineHeight: 1.6 }}>
          <div style={{ color: theme.text }}>
            <span style={{ color: theme.green }}>❯ </span>
            {command.slice(0, typedChars)}
            {typedChars < command.length && <span style={{ color: theme.accent2 }}>▌</span>}
          </div>
          <div style={{ marginTop: 16 }}>
            {outputLines.map((line, i) => {
              const at = outputAtSecond * FPS + i * 2;
              const appear = interpolate(frame, [at, at + 5], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const highlighted = highlightPattern?.test(line) ?? false;
              return (
                <div
                  key={i}
                  style={{
                    opacity: appear,
                    whiteSpace: "pre",
                    color: highlighted ? theme.accent2 : theme.text,
                    fontWeight: highlighted ? 700 : 400,
                  }}
                >
                  {line.length === 0 ? " " : line}
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    </SceneShell>
  );
};
