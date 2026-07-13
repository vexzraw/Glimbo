export type Arena = { x: number; y: number; size: number };

export function getArena(width: number, height: number, topPad = 96): Arena {
  const availH = height - topPad - 48;
  const availW = width - 48;
  const size = Math.max(160, Math.min(availW, availH, 880));
  const x = (width - size) / 2;
  const y = topPad + Math.max(0, (availH - size) / 2);
  return { x, y, size };
}

export function toScreen(nx: number, ny: number, arena: Arena) {
  return { x: arena.x + nx * arena.size, y: arena.y + ny * arena.size };
}
