import React from "react";
import { Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { SceneShell } from "./SceneShell";

export type MontageItem = {
  readonly icon: string;
  readonly label: string;
  readonly sub?: string;
  readonly atSecond?: number;
};

export const MontageBeat: React.FC<{
  kicker?: string;
  title?: string;
  items: readonly MontageItem[];
  staggerFrames?: number;
}> = ({ kicker, title, items, staggerFrames = 9 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneShell kicker={kicker} title={title} center>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 1200 }}>
        {items.map((item, i) => {
          const at = item.atSecond !== undefined ? Math.round(item.atSecond * 30) : 8 + i * staggerFrames;
          const pop = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 190, mass: 0.5 } });
          return (
            <React.Fragment key={i}>
              {frame >= at && (
                <Sequence from={at} name={`tick-${i}`}>
                  <Audio src={staticFile("sfx/tick.wav")} volume={0.35} />
                </Sequence>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  backgroundColor: theme.bgPanel,
                  border: `1px solid ${theme.stroke}`,
                  borderRadius: 16,
                  padding: "22px 34px",
                  transform: `translateX(${(1 - pop) * 200}px) scale(${0.9 + pop * 0.1})`,
                  opacity: pop,
                }}
              >
                <span style={{ fontSize: 44 }}>{item.icon}</span>
                <span style={{ fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: 36, color: theme.text }}>
                  {item.label}
                </span>
                {item.sub && (
                  <span style={{ fontFamily: theme.fontMono, fontSize: 25, color: theme.textDim, marginLeft: "auto" }}>
                    {item.sub}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </SceneShell>
  );
};
