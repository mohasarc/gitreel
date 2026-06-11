import React from "react";
import { Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, severityColor, severityLabel, theme, type Severity } from "../theme";

export type Finding = {
  readonly severity: Severity;
  readonly title: string;
  readonly detail?: string;
  readonly atSecond: number;
};

export const CalloutOverlay: React.FC<{ finding: Finding }> = ({ finding }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = Math.round(finding.atSecond * FPS);
  const slide = spring({ frame: frame - startFrame, fps, config: { damping: 15, stiffness: 170, mass: 0.6 } });
  if (frame < startFrame) return null;
  const color = severityColor[finding.severity];
  return (
    <>
      <Sequence from={startFrame} name="finding-sting">
        <Audio src={staticFile("sfx/sting.wav")} volume={0.5} />
      </Sequence>
      <div
        style={{
          position: "absolute",
          right: 72,
          bottom: 64,
          maxWidth: 760,
          backgroundColor: theme.bgPanel,
          border: `2px solid ${color}`,
          borderLeft: `12px solid ${color}`,
          borderRadius: 16,
          padding: "26px 32px",
          boxShadow: `0 24px 70px rgba(0,0,0,0.6), 0 0 40px ${color}22`,
          transform: `translateY(${(1 - slide) * 120}px) rotate(${(1 - slide) * 2}deg)`,
          opacity: slide,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: 3,
            color,
            marginBottom: 10,
          }}
        >
          {severityIcon(finding.severity)} {severityLabel[finding.severity]}
        </div>
        <div style={{ fontFamily: theme.fontDisplay, fontWeight: 600, fontSize: 32, color: theme.text }}>
          {finding.title}
        </div>
        {finding.detail && (
          <div style={{ fontFamily: theme.fontDisplay, fontSize: 26, color: theme.textDim, marginTop: 10 }}>
            {finding.detail}
          </div>
        )}
      </div>
    </>
  );
};

const severityIcon = (severity: Severity): string =>
  severity === "blocking" ? "🛑" : severity === "warn" ? "⚠️" : "🔍";
