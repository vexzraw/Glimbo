import { SHAPES_BY_ID } from "../lib/shapes";
import { smoothPath } from "../lib/smoothPath";
import { ALL_LEVELS } from "../lib/levels";

// deterministic pseudo-random positions so the sky doesn't jump around on re-render
function seededPos(seed: number) {
  const x = (Math.sin(seed * 999.7) * 0.5 + 0.5);
  const y = (Math.sin(seed * 431.3 + 5) * 0.5 + 0.5);
  return { left: `${8 + x * 84}%`, top: `${8 + y * 60}%` };
}

export function FirmamentPreview({ completedLevels }: { completedLevels: Record<string, boolean> }) {
  const done = ALL_LEVELS.filter((l) => completedLevels[l.id]);
  if (done.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {done.map((level, i) => {
        const pos = seededPos(i + 1);
        return (
          <div
            key={level.id}
            className="animate-glimbo-float absolute opacity-70"
            style={{ ...pos, animationDelay: `${i * 0.7}s`, width: 64, height: 64 }}
          >
            <svg viewBox="0 0 1 1" className="h-full w-full drop-shadow-[0_0_12px_rgba(180,170,255,0.55)]">
              {level.shapeIds.map((sid, si) => {
                const shape = SHAPES_BY_ID[sid];
                if (!shape) return null;
                return (
                  <path
                    key={sid}
                    d={smoothPath(shape.points, shape.closed)}
                    fill={si === 1 ? level.trailColorSecondary || level.glow : level.trailColor}
                    fillOpacity={0.5}
                    stroke={si === 1 ? level.trailColorSecondary || level.glow : level.trailColor}
                    strokeWidth={0.012}
                  />
                );
              })}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
