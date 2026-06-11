import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { SceneShell } from "./SceneShell";

export const TitleCard: React.FC<{
  chip?: string;
  words: readonly string[];
  subtitle?: string;
}> = ({ chip, words, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneShell center>
      <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        {chip && (
          <Pop at={0}>
            <span
              style={{
                fontFamily: theme.fontMono,
                fontSize: 30,
                color: theme.accent2,
                border: `2px solid ${theme.accent2}55`,
                borderRadius: 999,
                padding: "8px 28px",
                marginBottom: 40,
                display: "inline-block",
              }}
            >
              {chip}
            </span>
          </Pop>
        )}
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center", maxWidth: 1500 }}>
          {words.map((word, i) => {
            const pop = spring({ frame: frame - 6 - i * 5, fps, config: { damping: 13, stiffness: 160, mass: 0.6 } });
            return (
              <span
                key={i}
                style={{
                  fontFamily: theme.fontDisplay,
                  fontWeight: 800,
                  fontSize: 120,
                  color: i === words.length - 1 ? theme.accent : theme.text,
                  transform: `scale(${pop}) rotate(${(1 - pop) * (i % 2 === 0 ? -4 : 4)}deg)`,
                  display: "inline-block",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        {subtitle && (
          <Pop at={14 + words.length * 5}>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: 38, color: theme.textDim, marginTop: 36 }}>
              {subtitle}
            </div>
          </Pop>
        )}
      </AbsoluteFill>
    </SceneShell>
  );
};

export const Pop: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 150, mass: 0.6 } });
  return <div style={{ transform: `scale(${pop})`, opacity: Math.min(1, pop * 1.4) }}>{children}</div>;
};
