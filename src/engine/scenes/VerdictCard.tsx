import React from "react";
import { Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, severityColor, theme, type Severity } from "../theme";
import { SceneShell } from "./SceneShell";

export type VerdictCount = { readonly severity: Severity; readonly count: number; readonly label: string };

export const VerdictCard: React.FC<{
  counts: readonly VerdictCount[];
  stamp: string;
  stampColor?: string;
  stampAtSecond?: number;
}> = ({ counts, stamp, stampColor = theme.green, stampAtSecond = 1.6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stampFrame = stampAtSecond * FPS;
  const stampPop = spring({ frame: frame - stampFrame, fps, config: { damping: 11, stiffness: 230, mass: 0.8 } });
  return (
    <SceneShell kicker="the verdict" center>
      <div style={{ display: "flex", gap: 40, marginBottom: 80 }}>
        {counts.map((entry, i) => {
          const pop = spring({ frame: frame - 6 - i * 7, fps, config: { damping: 14, stiffness: 170, mass: 0.6 } });
          const color = severityColor[entry.severity];
          return (
            <div
              key={i}
              style={{
                width: 330,
                backgroundColor: theme.bgPanel,
                border: `2px solid ${color}55`,
                borderTop: `8px solid ${color}`,
                borderRadius: 18,
                padding: "34px 30px",
                textAlign: "center",
                transform: `scale(${pop})`,
                opacity: pop,
              }}
            >
              <div style={{ fontFamily: theme.fontDisplay, fontWeight: 800, fontSize: 96, color }}>{entry.count}</div>
              <div
                style={{
                  fontFamily: theme.fontDisplay,
                  fontWeight: 600,
                  fontSize: 28,
                  letterSpacing: 2,
                  color: theme.textDim,
                  textTransform: "uppercase",
                }}
              >
                {entry.label}
              </div>
            </div>
          );
        })}
      </div>
      {frame >= stampFrame && (
        <Sequence from={Math.round(stampFrame)} name="stamp-thud">
          <Audio src={staticFile("sfx/thud.wav")} volume={0.6} />
        </Sequence>
      )}
      <div
        style={{
          fontFamily: theme.fontDisplay,
          fontWeight: 900,
          fontSize: 110,
          letterSpacing: 6,
          color: stampColor,
          border: `10px solid ${stampColor}`,
          borderRadius: 24,
          padding: "10px 60px",
          transform: `rotate(-7deg) scale(${0.6 + stampPop * 0.4})`,
          opacity: stampPop,
          textShadow: `0 0 60px ${stampColor}66`,
        }}
      >
        {stamp}
      </div>
    </SceneShell>
  );
};
