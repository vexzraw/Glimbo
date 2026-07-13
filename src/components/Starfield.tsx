import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  parallax: number;
};

type Dust = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

export function Starfield({ boostRef }: { boostRef?: React.RefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let dust: Dust[] = [];
    let raf = 0;
    let t = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((width * height) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.25,
        twinkleSpeed: Math.random() * 0.6 + 0.2,
        twinklePhase: Math.random() * Math.PI * 2,
        parallax: Math.random() * 0.6 + 0.2,
      }));
    }

    resize();
    window.addEventListener("resize", resize);

    function spawnDust(boost: number) {
      const spawnCount = Math.floor(boost * 3);
      for (let i = 0; i < spawnCount; i++) {
        dust.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          life: 0,
          maxLife: 60 + Math.random() * 60,
          size: Math.random() * 1.6 + 0.5,
        });
      }
      if (dust.length > 400) dust.splice(0, dust.length - 400);
    }

    function loop() {
      t += 0.016;
      const boost = boostRef?.current ?? 0;
      ctx!.clearRect(0, 0, width, height);

      // deep gradient backdrop
      const grad = ctx!.createRadialGradient(
        width * 0.5, height * 0.35, 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, "#0e0b26");
      grad.addColorStop(0.55, "#070515");
      grad.addColorStop(1, "#030209");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, width, height);

      for (const s of stars) {
        const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.25;
        ctx!.beginPath();
        ctx!.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx!.fillStyle = "#f4f2ff";
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      if (boost > 0.05) spawnDust(boost);

      dust.forEach((d) => {
        d.x += d.vx * (1 + boost * 2);
        d.y += d.vy * (1 + boost * 2);
        d.life++;
        const lifeRatio = 1 - d.life / d.maxLife;
        ctx!.beginPath();
        ctx!.globalAlpha = Math.max(0, lifeRatio * 0.5);
        ctx!.fillStyle = "#cbb9ff";
        ctx!.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx!.fill();
      });
      ctx!.globalAlpha = 1;
      dust = dust.filter((d) => d.life < d.maxLife);

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [boostRef]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
}
