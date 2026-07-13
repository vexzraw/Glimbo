export type Point = { x: number; y: number };

/**
 * Converts an array of points into a smooth SVG path string using
 * Catmull-Rom to Bezier interpolation. Produces soft, organic,
 * "dreamy" curves instead of jagged polylines.
 */
export function smoothPath(points: Point[], closed = true): string {
  if (points.length < 2) return "";
  const pts = closed ? points : points;
  const getPoint = (i: number): Point => {
    if (closed) {
      const n = pts.length;
      return pts[(i % n + n) % n];
    }
    if (i < 0) return pts[0];
    if (i >= pts.length) return pts[pts.length - 1];
    return pts[i];
  };

  let d = `M ${pts[0].x} ${pts[0].y} `;
  const count = closed ? pts.length : pts.length - 1;
  const tension = 6;

  for (let i = 0; i < count; i++) {
    const p0 = getPoint(i - 1);
    const p1 = getPoint(i);
    const p2 = getPoint(i + 1);
    const p3 = getPoint(i + 2);

    const cp1x = p1.x + (p2.x - p0.x) / tension;
    const cp1y = p1.y + (p2.y - p0.y) / tension;
    const cp2x = p2.x - (p3.x - p1.x) / tension;
    const cp2y = p2.y - (p3.y - p1.y) / tension;

    d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `;
  }

  if (closed) d += "Z";
  return d;
}

/** Distance from point p to segment ab */
export function distToSegment(p: Point, a: Point, b: Point): number {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * (b.x - a.x);
  const projY = a.y + t * (b.y - a.y);
  return Math.hypot(p.x - projX, p.y - projY);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
