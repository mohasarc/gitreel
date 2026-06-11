import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, theme } from "../theme";
import { SceneShell } from "./SceneShell";

export type FileEntry = {
  readonly name: string;
  readonly status: "added" | "modified";
  readonly note?: string;
};

export type FileGroup = {
  readonly label: string;
  readonly icon: string;
  readonly files: readonly FileEntry[];
  readonly more?: number;
};

export type GroupSpotlight = {
  readonly atSecond: number;
  readonly groupIndex: number | null;
};

export const FileTreeScene: React.FC<{
  kicker?: string;
  title?: string;
  groups: readonly FileGroup[];
  spotlights?: readonly GroupSpotlight[];
  columns?: number;
}> = ({ kicker, title, groups, spotlights = [], columns = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const second = frame / FPS;
  const active = [...spotlights].reverse().find((beat) => second >= beat.atSecond);
  const activeIndex = active?.groupIndex ?? null;
  return (
    <SceneShell kicker={kicker} title={title} center>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 28,
          width: "100%",
          alignItems: "start",
        }}
      >
        {groups.map((group, groupIndex) => {
          const pop = spring({ frame: frame - 6 - groupIndex * 6, fps, config: { damping: 15, stiffness: 160, mass: 0.6 } });
          const lit = activeIndex === null || activeIndex === groupIndex;
          return (
            <div
              key={groupIndex}
              style={{
                backgroundColor: theme.bgPanel,
                border: `2px solid ${lit && activeIndex !== null ? theme.accent : theme.stroke}`,
                borderRadius: 18,
                padding: "24px 28px",
                opacity: pop * (lit ? 1 : 0.3),
                transform: `translateY(${(1 - pop) * 40}px) scale(${lit && activeIndex !== null ? 1.02 : 1})`,
                boxShadow: lit && activeIndex !== null ? `0 0 50px ${theme.accent}2a` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <span style={{ fontSize: 30 }}>{group.icon}</span>
                <span style={{ fontFamily: theme.fontMono, fontWeight: 700, fontSize: 27, color: theme.accent2 }}>
                  {group.label}
                </span>
              </div>
              {group.files.map((file, fileIndex) => {
                const fileAt = 10 + groupIndex * 6 + fileIndex * 3;
                const filePop = spring({ frame: frame - fileAt, fps, config: { damping: 18, stiffness: 200, mass: 0.4 } });
                const color = file.status === "added" ? theme.green : theme.amber;
                return (
                  <div
                    key={fileIndex}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "5px 0",
                      opacity: filePop,
                      transform: `translateX(${(1 - filePop) * 20}px)`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: theme.fontMono,
                        fontWeight: 800,
                        fontSize: 21,
                        color,
                        width: 26,
                        textAlign: "center",
                        backgroundColor: `${color}1a`,
                        borderRadius: 6,
                        flexShrink: 0,
                      }}
                    >
                      {file.status === "added" ? "A" : "M"}
                    </span>
                    <span
                      style={{
                        fontFamily: theme.fontMono,
                        fontSize: 22.5,
                        color: theme.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {file.name}
                    </span>
                    {file.note && (
                      <span style={{ fontFamily: theme.fontDisplay, fontSize: 19, color: theme.textDim, marginLeft: "auto", flexShrink: 0 }}>
                        {file.note}
                      </span>
                    )}
                  </div>
                );
              })}
              {group.more !== undefined && group.more > 0 && (
                <div style={{ fontFamily: theme.fontDisplay, fontSize: 21, color: theme.textDim, marginTop: 10 }}>
                  + {group.more} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};
