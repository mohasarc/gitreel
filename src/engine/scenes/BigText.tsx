import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { SceneShell } from "./SceneShell";

export const BigText: React.FC<{
  emoji?: string;
  text: string;
  sub?: string;
  color?: string;
}> = ({ emoji, text, sub, color = theme.text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 180, mass: 0.7 } });
  const subPop = spring({ frame: frame - 12, fps, config: { damping: 15, stiffness: 150, mass: 0.6 } });
  return (
    <SceneShell center>
      <div style={{ textAlign: "center", transform: `scale(${pop}) rotate(${(1 - pop) * -3}deg)` }}>
        {emoji && <div style={{ fontSize: 170, marginBottom: 24 }}>{emoji}</div>}
        <div style={{ fontFamily: theme.fontDisplay, fontWeight: 900, fontSize: 96, color, maxWidth: 1500 }}>
          {text}
        </div>
      </div>
      {sub && (
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: 36,
            color: theme.textDim,
            marginTop: 44,
            opacity: subPop,
            transform: `translateY(${(1 - subPop) * 30}px)`,
          }}
        >
          {sub}
        </div>
      )}
    </SceneShell>
  );
};
