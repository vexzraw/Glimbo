import { useEffect, useRef, useState, useCallback } from "react";
import type { LevelDef, LevelStar, StarColor } from "../lib/types";
import { getArena, toScreen, type Arena } from "../lib/arena";
import { distToSegment } from "../lib/smoothPath";
import { audioEngine } from "../lib/audioEngine";
import { RevealArt } from "./RevealArt";

type Pt = { x: number; y: number };

type RuntimeStar = LevelStar & { activated: boolean; noteIndex: number };

type Spark = {
  color: StarColor;
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: Pt[];
  fadingTrails: { pts: Pt[]; born: number }[];
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; r: number };

const SPARK_R = 0.02;
const STAR_R = 0.024;
const ACTIVATE_DIST = SPARK_R + STAR_R + 0.006;
const MIN_TRAIL_DIST = 0.0055;
const SAFE_POINTS = 13;
// How close (in normalized arena units) the user must press to grab a spark.
// Generous so it's forgiving on touch screens, but still requires touching the star.
const GRAB_RADIUS = 0.15;
// How quickly the spark closes the distance to the pointer each frame (0-1).
// A plain first-order chase (no springy velocity) so it never overshoots or oscillates.
const FOLLOW_RATE = 0.22;

function makeSparks(level: LevelDef): Spark[] {
  if (level.twinMode) {
    return [
      { color: "pink", x: 0.5, y: 0.5, vx: 0, vy: 0, trail: [], fadingTrails: [] },
      { color: "blue", x: 0.5, y: 0.5, vx: 0, vy: 0, trail: [], fadingTrails: [] },
    ];
  }
  return [{ color: "white", x: 0.5, y: 0.5, vx: 0, vy: 0, trail: [], fadingTrails: [] }];
}

function makeStars(level: LevelDef): RuntimeStar[] {
  return level.stars.map((s, i) => ({ ...s, activated: false, noteIndex: i }));
}

export function GameCanvas({
  level,
  boostRef,
  onLevelComplete,
  onFailure,
}: {
  level: LevelDef;
  boostRef: React.RefObject<number>;
  onLevelComplete: () => void;
  onFailure: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const arenaRef = useRef<Arena>({ x: 0, y: 0, size: 0 });
  const sparksRef = useRef<Spark[]>(makeSparks(level));
  const starsRef = useRef<RuntimeStar[]>(makeStars(level));
  const homeActivatedRef = useRef<Record<string, boolean>>({});
  const revealStartRef = useRef<Record<string, number>>({});
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0.5, y: 0.5 });
  const rafRef = useRef(0);
  const startedAtRef = useRef(performance.now());
  const revealTriggeredRef = useRef(false);

  const [revealPhase, setRevealPhase] = useState<"hidden" | "drawing" | "alive" | "flyaway">("hidden");
  const [activatedCount, setActivatedCount] = useState(0);
  const [failPulse, setFailPulse] = useState(0);
  const revealPhaseRef = useRef(revealPhase);
  revealPhaseRef.current = revealPhase;

  // reset when level changes
  useEffect(() => {
    sparksRef.current = makeSparks(level);
    starsRef.current = makeStars(level);
    homeActivatedRef.current = {};
    revealStartRef.current = {};
    particlesRef.current = [];
    revealTriggeredRef.current = false;
    startedAtRef.current = performance.now();
    setRevealPhase("hidden");
    setActivatedCount(0);
  }, [level]);

  const resetLevel = useCallback((playChime: boolean) => {
    const now = performance.now();
    sparksRef.current.forEach((s) => {
      if (s.trail.length > 1) s.fadingTrails.push({ pts: s.trail, born: now });
      s.trail = [];
      s.x = 0.5;
      s.y = 0.5;
      s.vx = 0;
      s.vy = 0;
    });
    starsRef.current.forEach((st) => (st.activated = false));
    homeActivatedRef.current = {};
    revealStartRef.current = {};
    setActivatedCount(0);
    if (playChime) {
      audioEngine.playBreakChime();
      setFailPulse((p) => p + 1);
      onFailure();
    }
  }, [onFailure]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = container!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      arenaRef.current = getArena(rect.width, rect.height);
    }
    resize();
    window.addEventListener("resize", resize);

    function toNorm(px: number, py: number): Pt {
      const a = arenaRef.current;
      return { x: (px - a.x) / a.size, y: (py - a.y) / a.size };
    }

    function handleDown(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const norm = toNorm(px, py);
      // Only start dragging if the press lands on (or very near) a spark.
      // This is what stops the star from teleporting toward a random tap.
      const grabbed = sparksRef.current.some(
        (s) => Math.hypot(norm.x - s.x, norm.y - s.y) < GRAB_RADIUS
      );
      if (!grabbed) return;
      pointerRef.current.active = true;
      pointerRef.current.x = px;
      pointerRef.current.y = py;
    }
    function handleMove(e: PointerEvent) {
      if (!pointerRef.current.active) return;
      const rect = canvas!.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
    }
    function handleUp() {
      pointerRef.current.active = false;
      // Stop dead in place — no drifting/gliding once the user lets go.
      sparksRef.current.forEach((s) => {
        s.vx = 0;
        s.vy = 0;
      });
    }
    canvas.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    function starPos(star: RuntimeStar, t: number): Pt {
      if (star.movement.type === "circle") {
        const m = star.movement;
        return {
          x: star.x + Math.cos(t * m.speed + m.phase) * m.radius,
          y: star.y + Math.sin(t * m.speed + m.phase) * m.radius,
        };
      }
      if (star.movement.type === "line") {
        const m = star.movement;
        const s = (Math.sin(t * m.speed + m.phase) + 1) / 2;
        return { x: star.x + m.dx * s, y: star.y + m.dy * s };
      }
      return { x: star.x, y: star.y };
    }

    function spawnBurst(x: number, y: number, color: string, count = 16) {
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 0.006 + Math.random() * 0.012;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          life: 0,
          maxLife: 40 + Math.random() * 20,
          color,
          r: Math.random() * 2 + 1,
        });
      }
    }

    function colorHex(c: StarColor): string {
      if (c === "pink") return level.trailColorPrimary || "#ff8fd8";
      if (c === "blue") return level.trailColorSecondary || "#7ec8ff";
      return level.trailColor;
    }

    let lastTime = performance.now();

    function loop() {
      const now = performance.now();
      const dt = Math.min(40, now - lastTime) / 16.67;
      lastTime = now;
      const t = (now - startedAtRef.current) / 1000;
      const arena = arenaRef.current;
      const ctx2 = ctx!;

      ctx2.clearRect(0, 0, canvas!.width / dpr, canvas!.height / dpr);

      const playing = revealPhaseRef.current === "hidden";

      // ---- update physics ----
      if (playing) {
        const ptr = pointerRef.current;
        const targetNorm = ptr.active ? toNorm(ptr.x, ptr.y) : null;

        sparksRef.current.forEach((spark, si) => {
          const prevX = spark.x;
          const prevY = spark.y;

          let tx = spark.x;
          let ty = spark.y;
          if (targetNorm) {
            if (level.twinMode && si === 1) {
              tx = 1 - targetNorm.x;
              ty = targetNorm.y;
            } else {
              tx = targetNorm.x;
              ty = targetNorm.y;
            }
          }

          if (targetNorm) {
            // Smooth, frame-rate independent chase toward wherever the user is
            // dragging. This is a first-order "ease toward target" (no springy
            // velocity build-up), so it never overshoots and always feels like
            // it's gently going exactly where the user wants, at the speed the
            // user moves — not flinging off on its own.
            const followAmount = 1 - Math.pow(1 - FOLLOW_RATE, dt);
            spark.x += (tx - spark.x) * followAmount;
            spark.y += (ty - spark.y) * followAmount;
          }

          // Black holes are a separate, independent pull that decays on its own.
          // It never causes the spark to keep gliding once the user lets go of
          // it near a black hole — the impulse just fades out.
          spark.vx *= 0.9;
          spark.vy *= 0.9;
          level.blackHoles.forEach((bh) => {
            const dx = bh.x - spark.x;
            const dy = bh.y - spark.y;
            const dist = Math.hypot(dx, dy);
            const influence = bh.radius * 2.2;
            if (dist < influence && dist > 0.001) {
              const force = bh.strength * (1 - dist / influence) * 0.01;
              spark.vx += (dx / dist) * force;
              spark.vy += (dy / dist) * force;
            }
          });
          spark.x += spark.vx * dt;
          spark.y += spark.vy * dt;

          spark.x = Math.max(-0.05, Math.min(1.05, spark.x));
          spark.y = Math.max(-0.05, Math.min(1.05, spark.y));

          const speed = Math.hypot(spark.x - prevX, spark.y - prevY) / Math.max(dt, 0.0001);
          if (si === 0) {
            boostRef.current = Math.max(boostRef.current * 0.9, Math.min(1, speed * 30));
          }

          const last = spark.trail[spark.trail.length - 1];
          if (!last || Math.hypot(spark.x - last.x, spark.y - last.y) > MIN_TRAIL_DIST) {
            spark.trail.push({ x: spark.x, y: spark.y });
          }

          // collision check against own trail (excluding safe recent segment)
          if (spark.trail.length > SAFE_POINTS + 2) {
            const checkUntil = spark.trail.length - SAFE_POINTS;
            for (let i = 0; i < checkUntil - 1; i++) {
              const d = distToSegment(spark, spark.trail[i], spark.trail[i + 1]);
              if (d < SPARK_R * 0.85) {
                resetLevel(true);
                break;
              }
            }
          }

          // star activation
          starsRef.current.forEach((star) => {
            if (star.activated) return;
            if (level.twinMode && star.color !== spark.color) return;
            const canTouch = star.home || homeActivatedRef.current[spark.color] || homeActivatedRef.current["white"];
            if (!canTouch) return;
            const sp = starPos(star, t);
            const d = Math.hypot(spark.x - sp.x, spark.y - sp.y);
            if (d < ACTIVATE_DIST) {
              star.activated = true;
              if (star.home) {
                homeActivatedRef.current[star.color] = true;
                revealStartRef.current[star.color] = now;
              }
              const speedNorm = Math.max(0, Math.min(1, speed * 22));
              audioEngine.playStarNote(level.instrument, star.noteIndex, speedNorm);
              spawnBurst(sp.x, sp.y, colorHex(star.color));
              setActivatedCount((c) => c + 1);
            }
          });
        });

        // win check
        const allDone = starsRef.current.every((s) => s.activated);
        if (allDone && !revealTriggeredRef.current) {
          revealTriggeredRef.current = true;
          audioEngine.playCompleteChord(level.night);
          setTimeout(() => setRevealPhase("drawing"), 500);
        }
      }

      // ---- particles update ----
      particlesRef.current.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life += dt;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      // ---- fading trails cleanup ----
      sparksRef.current.forEach((s) => {
        s.fadingTrails = s.fadingTrails.filter((f) => now - f.born < 650);
      });

      // ================= DRAW =================
      // black holes
      level.blackHoles.forEach((bh) => {
        const c = toScreen(bh.x, bh.y, arena);
        const r = bh.radius * arena.size;
        const grad = ctx2.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 2.4);
        grad.addColorStop(0, "rgba(10,6,20,0.95)");
        grad.addColorStop(0.5, "rgba(60,30,90,0.35)");
        grad.addColorStop(1, "rgba(60,30,90,0)");
        ctx2.fillStyle = grad;
        ctx2.beginPath();
        ctx2.arc(c.x, c.y, r * 2.4, 0, Math.PI * 2);
        ctx2.fill();
        for (let i = 0; i < 3; i++) {
          const ang = t * (1.2 + i * 0.3) + i * 2;
          ctx2.strokeStyle = `rgba(190,150,255,${0.18 - i * 0.04})`;
          ctx2.lineWidth = 1.4;
          ctx2.beginPath();
          ctx2.arc(c.x, c.y, r * (0.5 + i * 0.35), ang, ang + 3.6);
          ctx2.stroke();
        }
      });

      // fading trails (fail feedback)
      sparksRef.current.forEach((spark) => {
        spark.fadingTrails.forEach((f) => {
          const age = (now - f.born) / 650;
          drawTrail(ctx2, f.pts.map((p) => toScreen(p.x, p.y, arena)), colorHex(spark.color), Math.max(0, 1 - age));
        });
      });

      // active trails
      sparksRef.current.forEach((spark) => {
        drawTrail(ctx2, spark.trail.map((p) => toScreen(p.x, p.y, arena)), colorHex(spark.color), 1);
      });

      // stars
      starsRef.current.forEach((star) => {
        const sp = starPos(star, t);
        const scr = toScreen(sp.x, sp.y, arena);
        const r = STAR_R * arena.size;
        const revealed = star.home || homeActivatedRef.current[star.color] || homeActivatedRef.current["white"];
        let alpha = 0.05;
        if (revealed) {
          const rs = revealStartRef.current[star.color] ?? now;
          const localT = Math.max(0, Math.min(1, (now - rs) / 900 - star.noteIndex * 0.05));
          alpha = star.home ? 1 : localT;
        }
        if (star.activated) alpha = 1;
        const pulse = star.home ? 0.85 + Math.sin(t * 3) * 0.15 : 0.75 + Math.sin(t * 2 + star.noteIndex) * 0.2;
        const col = colorHex(star.color);

        ctx2.globalAlpha = alpha;
        const glowR = r * (star.activated ? 3.2 : 4.2) * pulse;
        const grad = ctx2.createRadialGradient(scr.x, scr.y, 0, scr.x, scr.y, glowR);
        grad.addColorStop(0, star.activated ? col : "#ffffff");
        grad.addColorStop(0.4, star.activated ? col : "#e8e6ff");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx2.fillStyle = grad;
        ctx2.beginPath();
        ctx2.arc(scr.x, scr.y, glowR, 0, Math.PI * 2);
        ctx2.fill();

        ctx2.beginPath();
        ctx2.fillStyle = "#ffffff";
        ctx2.arc(scr.x, scr.y, r * (star.home ? 0.85 : 0.6), 0, Math.PI * 2);
        ctx2.fill();
        ctx2.globalAlpha = 1;
      });

      // particles
      particlesRef.current.forEach((p) => {
        const scr = toScreen(p.x, p.y, arena);
        const lifeRatio = 1 - p.life / p.maxLife;
        ctx2.globalAlpha = Math.max(0, lifeRatio);
        ctx2.fillStyle = p.color;
        ctx2.beginPath();
        ctx2.arc(scr.x, scr.y, p.r, 0, Math.PI * 2);
        ctx2.fill();
      });
      ctx2.globalAlpha = 1;

      // sparks
      if (playing) {
        sparksRef.current.forEach((spark) => {
          const scr = toScreen(spark.x, spark.y, arena);
          const r = SPARK_R * arena.size;
          const col = colorHex(spark.color);
          const grad = ctx2.createRadialGradient(scr.x, scr.y, 0, scr.x, scr.y, r * 3.4);
          grad.addColorStop(0, "#ffffff");
          grad.addColorStop(0.35, col);
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx2.fillStyle = grad;
          ctx2.beginPath();
          ctx2.arc(scr.x, scr.y, r * 3.4, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.beginPath();
          ctx2.fillStyle = "#ffffff";
          ctx2.arc(scr.x, scr.y, r * 0.8, 0, Math.PI * 2);
          ctx2.fill();
        });
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, resetLevel]);

  useEffect(() => {
    if (revealPhase === "drawing") {
      const timer = setTimeout(() => setRevealPhase("alive"), 2200);
      return () => clearTimeout(timer);
    }
    if (revealPhase === "alive") {
      const timer = setTimeout(() => setRevealPhase("flyaway"), 3000);
      return () => clearTimeout(timer);
    }
  }, [revealPhase]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 transition-opacity duration-[1400ms]"
        style={{ opacity: revealPhase === "hidden" ? 1 : 0.28 }}
      />
      <RevealArt
        arena={arenaRef.current}
        shapeIds={level.shapeIds}
        primaryColor={level.trailColorPrimary || level.trailColor}
        secondaryColor={level.trailColorSecondary}
        glow={level.glow}
        phase={revealPhase}
        flyTarget={{ x: 60, y: 60 }}
        onFlyAwayEnd={onLevelComplete}
      />
      {failPulse > 0 && (
        <div
          key={failPulse}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <p className="animate-fail-flash rounded-full bg-black/30 px-6 py-2 text-sm tracking-wide text-white/90 backdrop-blur-sm">
            El hilo se desvaneció suavemente... inténtalo de nuevo.
          </p>
        </div>
      )}
      <div className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/40 sm:top-24">
        {activatedCount} / {level.stars.length} estrellas
      </div>
    </div>
  );
}

function drawTrail(ctx: CanvasRenderingContext2D, pts: Pt[], color: string, alpha: number) {
  if (pts.length < 2 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = color;
  ctx.globalCompositeOperation = "lighter";

  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.lineWidth = 5.5;
  ctx.globalAlpha = alpha * 0.35;
  tracePath(ctx, pts);
  ctx.stroke();

  ctx.shadowBlur = 6;
  ctx.lineWidth = 2.4;
  ctx.globalAlpha = alpha * 0.9;
  tracePath(ctx, pts);
  ctx.stroke();

  ctx.restore();
}

function tracePath(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
}
