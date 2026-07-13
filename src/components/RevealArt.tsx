import { useEffect, useRef, useState } from "react";
import { SHAPES_BY_ID } from "../lib/shapes";
import { smoothPath } from "../lib/smoothPath";
import type { Arena } from "../lib/arena";

type Phase = "hidden" | "drawing" | "alive" | "flyaway";

export function RevealArt({
  arena,
  shapeIds,
  primaryColor,
  secondaryColor,
  glow,
  phase,
  flyTarget,
  onFlyAwayEnd,
}: {
  arena: Arena;
  shapeIds: string[];
  primaryColor: string;
  secondaryColor?: string;
  glow: string;
  phase: Phase;
  flyTarget?: { x: number; y: number };
  onFlyAwayEnd?: () => void;
}) {
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const [lengths, setLengths] = useState<Record<string, number>>({});

  useEffect(() => {
    if (phase !== "flyaway") return;
    const timeout = setTimeout(() => onFlyAwayEnd?.(), 1100);
    return () => clearTimeout(timeout);
  }, [phase, onFlyAwayEnd]);

  if (phase === "hidden") return null;

  const flyX = flyTarget ? (flyTarget.x - (arena.x + arena.size / 2)) : 0;
  const flyY = flyTarget ? (flyTarget.y - (arena.y + arena.size / 2)) : 0;

  return (
    <svg
      className="pointer-events-none absolute"
      style={{
        left: arena.x,
        top: arena.y,
        width: arena.size,
        height: arena.size,
        transition: phase === "flyaway" ? "transform 1.05s cubic-bezier(.6,0,.4,1), opacity 1.05s ease" : undefined,
        transform: phase === "flyaway" ? `translate(${flyX}px, ${flyY}px) scale(0.08)` : "translate(0,0) scale(1)",
        opacity: phase === "flyaway" ? 0 : 1,
      }}
      viewBox="0 0 1 1"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="reveal-grad-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.85" />
          <stop offset="55%" stopColor={glow} stopOpacity="0.65" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.85" />
        </linearGradient>
        {secondaryColor && (
          <linearGradient id="reveal-grad-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.85" />
            <stop offset="55%" stopColor={glow} stopOpacity="0.65" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.85" />
          </linearGradient>
        )}
        <filter id="reveal-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.006" />
        </filter>
      </defs>

      <g
        className={
          phase === "alive"
            ? shapeIds.includes("bird")
              ? "reveal-flap"
              : shapeIds.includes("heart")
              ? "reveal-heartbeat"
              : shapeIds.includes("tree")
              ? "reveal-sway"
              : shapeIds.includes("gem")
              ? "reveal-sparkle"
              : shapeIds.includes("hand-pink")
              ? "reveal-embrace"
              : "reveal-breathe"
            : ""
        }
        style={{ transformOrigin: "0.5px 0.5px" }}
      >
        {shapeIds.map((id, i) => {
          const shape = SHAPES_BY_ID[id];
          if (!shape) return null;
          const d = smoothPath(shape.points, shape.closed);
          const len = lengths[id] ?? 3;
          const fillId = i === 1 && secondaryColor ? "url(#reveal-grad-b)" : "url(#reveal-grad-a)";
          const stroke = i === 1 && secondaryColor ? secondaryColor : primaryColor;
          return (
            <path
              key={id}
              ref={(el) => {
                pathRefs.current[id] = el;
                if (el) {
                  const len = el.getTotalLength();
                  setLengths((prev) => (prev[id] === len ? prev : { ...prev, [id]: len }));
                }
              }}
              d={d}
              fill={fillId}
              filter="url(#reveal-soft)"
              stroke={stroke}
              strokeWidth={0.006}
              strokeLinejoin="round"
              style={{
                strokeDasharray: len,
                strokeDashoffset: phase === "drawing" ? len : 0,
                fillOpacity: phase === "drawing" ? 0 : 1,
                transition: `stroke-dashoffset 1.4s ease ${i * 0.25}s, fill-opacity 1.2s ease ${0.9 + i * 0.25}s`,
                filter: `drop-shadow(0 0 0.02px ${glow})`,
              }}
            />
          );
        })}
      </g>
    </svg>
  );
}
