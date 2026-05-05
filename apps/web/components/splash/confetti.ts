// Lightweight one-shot canvas confetti. Mounts a transient canvas to the body
// so callers don't need to render a <canvas> in their JSX.

const COLORS = [
  "#FF3D7F",
  "#FFE8F0",
  "#7B68EE",
  "#F5A623",
  "#4CAF82",
  "#2196F3",
  "#ffffff",
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  r: number;
  c: string;
  a: number;
  va: number;
  shape: "rect" | "circle";
}

export function fireConfetti({
  particles = 220,
  durationMs = 3500,
}: { particles?: number; durationMs?: number } = {}) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:100;width:100vw;height:100vh";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const W = (canvas.width = window.innerWidth);
  const H = (canvas.height = window.innerHeight);

  const parts: Particle[] = Array.from({ length: particles }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 60,
    y: H / 2 - 40,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 16 - 6,
    g: 0.5 + Math.random() * 0.3,
    r: 4 + Math.random() * 5,
    c: COLORS[(Math.random() * COLORS.length) | 0]!,
    a: Math.random() * Math.PI * 2,
    va: (Math.random() - 0.5) * 0.3,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));

  let raf = 0;
  const t0 = performance.now();
  const frame = (t: number) => {
    const elapsed = t - t0;
    ctx.clearRect(0, 0, W, H);
    parts.forEach((p) => {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = p.c;
      if (p.shape === "rect") ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
      else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    if (elapsed < durationMs) {
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(frame);
}
