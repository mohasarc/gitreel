import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, theme } from "../theme";
import { SceneShell } from "./SceneShell";

export type DiagramNode = {
  readonly id: string;
  readonly label: string;
  readonly sub?: string;
  readonly icon?: string;
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly kind?: "existing" | "new" | "focus";
  readonly atSecond?: number;
};

export type ArrowSide = "top" | "bottom" | "left" | "right";

export type DiagramArrow = {
  readonly from: string;
  readonly to: string;
  readonly label?: string;
  readonly atSecond?: number;
  readonly kind?: "existing" | "new";
  readonly fromSide?: ArrowSide;
  readonly toSide?: ArrowSide;
};

const DEFAULT_W = 400;
const DEFAULT_H = 150;

export const DiagramScene: React.FC<{
  kicker?: string;
  title?: string;
  nodes: readonly DiagramNode[];
  arrows: readonly DiagramArrow[];
  legend?: boolean;
}> = ({ kicker, title, nodes, arrows, legend = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return (
    <SceneShell kicker={kicker} title={title}>
      <div style={{ position: "relative", flex: 1 }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <filter id="arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {arrows.map((arrow, i) => {
            const from = byId.get(arrow.from);
            const to = byId.get(arrow.to);
            if (!from || !to) return null;
            const fromSide = arrow.fromSide ?? autoSide(from, to);
            const toSide = arrow.toSide ?? autoSide(to, from);
            const start = sideAnchor(from, fromSide);
            const end = sideAnchor(to, toSide);
            const reach = Math.min(170, Math.hypot(end.x - start.x, end.y - start.y) * 0.45);
            const c1 = offsetAlongNormal(start, fromSide, reach);
            const c2 = offsetAlongNormal(end, toSide, reach);
            const path = `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
            const length = approximateCubicLength(start, c1, c2, end);
            const startFrame = (arrow.atSecond ?? 0) * FPS;
            const drawn = interpolate(frame, [startFrame, startFrame + 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            if (drawn === 0) return null;
            const dim = arrow.kind === "existing";
            const color = dim ? "#4a5268" : theme.accent2;
            const tip = pointOnCubic(start, c1, c2, end, Math.min(1, drawn));
            const beforeTip = pointOnCubic(start, c1, c2, end, Math.max(0, drawn - 0.04));
            const angle = Math.atan2(tip.y - beforeTip.y, tip.x - beforeTip.x) * (180 / Math.PI);
            const mid = pointOnCubic(start, c1, c2, end, 0.5);
            return (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={dim ? 4 : 6}
                  strokeLinecap="round"
                  strokeDasharray={length}
                  strokeDashoffset={length * (1 - drawn)}
                  filter={dim ? undefined : "url(#arrow-glow)"}
                  opacity={dim ? 0.8 : 1}
                />
                <g transform={`translate(${tip.x}, ${tip.y}) rotate(${angle})`}>
                  <polygon points="0,0 -22,-10 -22,10" fill={color} filter={dim ? undefined : "url(#arrow-glow)"} />
                </g>
                {arrow.label && drawn > 0.7 && (
                  <text
                    x={mid.x}
                    y={mid.y - 16}
                    fill={theme.textDim}
                    fontFamily={theme.fontMono}
                    fontSize={24}
                    textAnchor="middle"
                  >
                    {arrow.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {nodes.map((node) => {
          const startFrame = (node.atSecond ?? 0) * FPS;
          const pop = spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 160, mass: 0.6 } });
          const isNew = node.kind === "new" || node.kind === "focus";
          const borderColor = node.kind === "focus" ? theme.accent : isNew ? theme.green : "#39415a";
          const w = node.w ?? DEFAULT_W;
          const h = node.h ?? DEFAULT_H;
          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: node.x - w / 2,
                top: node.y - h / 2,
                width: w,
                height: h,
                background: isNew
                  ? `linear-gradient(160deg, ${theme.bgPanel} 0%, #1a1430 100%)`
                  : `linear-gradient(160deg, ${theme.bgPanel} 0%, #141927 100%)`,
                border: `3px solid ${borderColor}`,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                transform: `scale(${pop})`,
                opacity: pop * (isNew ? 1 : 0.78),
                boxShadow: isNew ? `0 0 60px ${borderColor}40` : "0 16px 40px rgba(0,0,0,0.4)",
              }}
            >
              {node.icon && <span style={{ fontSize: 46 }}>{node.icon}</span>}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                <div
                  style={{
                    fontFamily: theme.fontMono,
                    fontSize: 33,
                    fontWeight: 700,
                    color: isNew ? theme.text : "#aab2c5",
                  }}
                >
                  {node.label}
                </div>
                {node.sub && (
                  <div style={{ fontFamily: theme.fontDisplay, fontSize: 23, color: theme.textDim }}>{node.sub}</div>
                )}
              </div>
              {isNew && (
                <div
                  style={{
                    position: "absolute",
                    top: -18,
                    right: -16,
                    fontFamily: theme.fontDisplay,
                    fontWeight: 800,
                    fontSize: 19,
                    letterSpacing: 2,
                    color: theme.bg,
                    backgroundColor: node.kind === "focus" ? theme.accent : theme.green,
                    borderRadius: 999,
                    padding: "6px 16px",
                    boxShadow: `0 0 30px ${node.kind === "focus" ? theme.accent : theme.green}66`,
                  }}
                >
                  NEW
                </div>
              )}
            </div>
          );
        })}
        {legend && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              display: "flex",
              gap: 32,
              alignItems: "center",
              fontFamily: theme.fontDisplay,
              fontSize: 24,
              color: theme.textDim,
              backgroundColor: `${theme.bgPanel}cc`,
              border: `1px solid ${theme.stroke}`,
              borderRadius: 12,
              padding: "12px 24px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, border: "3px solid #39415a", opacity: 0.78 }} />
              already existed
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, border: `3px solid ${theme.green}`, boxShadow: `0 0 14px ${theme.green}66` }} />
              this PR
            </span>
          </div>
        )}
      </div>
    </SceneShell>
  );
};

type Point = { x: number; y: number };

function autoSide(node: DiagramNode, towards: DiagramNode): ArrowSide {
  const dx = towards.x - node.x;
  const dy = towards.y - node.y;
  if (Math.abs(dx) * ((node.h ?? DEFAULT_H) / 2) > Math.abs(dy) * ((node.w ?? DEFAULT_W) / 2)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "bottom" : "top";
}

function sideAnchor(node: DiagramNode, side: ArrowSide): Point {
  const w = (node.w ?? DEFAULT_W) / 2;
  const h = (node.h ?? DEFAULT_H) / 2;
  if (side === "left") return { x: node.x - w - 8, y: node.y };
  if (side === "right") return { x: node.x + w + 8, y: node.y };
  if (side === "top") return { x: node.x, y: node.y - h - 8 };
  return { x: node.x, y: node.y + h + 8 };
}

function offsetAlongNormal(point: Point, side: ArrowSide, distance: number): Point {
  if (side === "left") return { x: point.x - distance, y: point.y };
  if (side === "right") return { x: point.x + distance, y: point.y };
  if (side === "top") return { x: point.x, y: point.y - distance };
  return { x: point.x, y: point.y + distance };
}

function pointOnCubic(start: Point, c1: Point, c2: Point, end: Point, t: number): Point {
  const inverse = 1 - t;
  const a = inverse * inverse * inverse;
  const b = 3 * inverse * inverse * t;
  const c = 3 * inverse * t * t;
  const d = t * t * t;
  return {
    x: a * start.x + b * c1.x + c * c2.x + d * end.x,
    y: a * start.y + b * c1.y + c * c2.y + d * end.y,
  };
}

function approximateCubicLength(start: Point, c1: Point, c2: Point, end: Point): number {
  let length = 0;
  let previous = start;
  for (let i = 1; i <= 20; i++) {
    const point = pointOnCubic(start, c1, c2, end, i / 20);
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  return length;
}
