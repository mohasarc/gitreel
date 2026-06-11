import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export const SceneShell: React.FC<{
  kicker?: string;
  title?: string;
  contextTag?: boolean;
  center?: boolean;
  children: React.ReactNode;
}> = ({ kicker, title, contextTag, center, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 200, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: "hidden" }}>
      <Backdrop />
      <AbsoluteFill style={{ padding: "64px 96px", display: "flex", flexDirection: "column" }}>
        {(kicker || title || contextTag) && (
          <div
            style={{
              marginBottom: 36,
              opacity: slide,
              transform: `translateY(${(1 - slide) * -30}px)`,
              display: "flex",
              alignItems: "baseline",
              gap: 24,
            }}
          >
            <div>
              {kicker && (
                <div
                  style={{
                    fontFamily: theme.fontDisplay,
                    fontWeight: 600,
                    fontSize: 26,
                    letterSpacing: 4,
                    textTransform: "uppercase",
                    color: theme.accent2,
                    marginBottom: 6,
                  }}
                >
                  {kicker}
                </div>
              )}
              {title && (
                <div style={{ fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: 52, color: theme.text }}>
                  {title}
                </div>
              )}
            </div>
            {contextTag && <ContextTag />}
          </div>
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: center ? "center" : "flex-start",
            alignItems: center ? "center" : "stretch",
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ContextTag: React.FC = () => (
  <span
    style={{
      fontFamily: theme.fontDisplay,
      fontWeight: 600,
      fontSize: 22,
      color: theme.textDim,
      border: `2px solid ${theme.stroke}`,
      borderRadius: 999,
      padding: "6px 18px",
      whiteSpace: "nowrap",
    }}
  >
    ⏪ existing code — not part of this PR
  </span>
);

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 600], [0, 80]);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.accent}14 0%, transparent 65%)`,
          top: -500 + drift * 0.4,
          left: -300,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.accent2}10 0%, transparent 65%)`,
          bottom: -450,
          right: -250 + drift * 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

export const Panel: React.FC<{ children: React.ReactNode; padding?: number; appearAtSecond?: number }> = ({
  children,
  padding = 36,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 16, stiffness: 140, mass: 0.7 } });
  return (
    <div
      style={{
        backgroundColor: theme.bgCode,
        border: `1px solid ${theme.stroke}`,
        borderRadius: 18,
        padding,
        boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        transform: `scale(${0.94 + pop * 0.06})`,
        opacity: pop,
        maxWidth: "100%",
      }}
    >
      {children}
    </div>
  );
};

export const FileChip: React.FC<{ path: string; badge?: string; badgeColor?: string }> = ({
  path,
  badge,
  badgeColor = theme.green,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
    <span
      style={{
        fontFamily: theme.fontMono,
        fontSize: 24,
        color: theme.accent2,
        backgroundColor: `${theme.accent2}14`,
        border: `1px solid ${theme.accent2}33`,
        borderRadius: 8,
        padding: "6px 16px",
      }}
    >
      {path}
    </span>
    {badge && (
      <span
        style={{
          fontFamily: theme.fontDisplay,
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: 2,
          color: badgeColor,
          backgroundColor: `${badgeColor}1a`,
          borderRadius: 8,
          padding: "6px 14px",
          textTransform: "uppercase",
        }}
      >
        {badge}
      </span>
    )}
  </div>
);
