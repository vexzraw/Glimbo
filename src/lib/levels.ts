import {
  MIRROR_SHAPE, EYE_SHAPE, BIRD_SHAPE, TREE_SHAPE, HEART_SHAPE, GEM_SHAPE,
  HAND_PINK_SHAPE, HAND_BLUE_SHAPE, type ShapeDef,
} from "./shapes";
import type { LevelStar, LevelDef, NightDef, StarColor, StarMovement } from "./types";

let uid = 0;
const nextId = () => `star-${uid++}`;

function starsFromShape(
  shape: ShapeDef,
  color: StarColor,
  opts: { movementFor?: (i: number) => StarMovement } = {}
): LevelStar[] {
  return shape.starIndices.map((pointIdx, i) => {
    const p = shape.points[pointIdx];
    const movement = opts.movementFor ? opts.movementFor(i) : { type: "static" as const };
    return {
      id: nextId(),
      x: p.x,
      y: p.y,
      color,
      home: i === 0,
      movement,
    };
  });
}

// ---------- NIGHT 1: El Despertar ----------
const level1_mirror: LevelDef = {
  id: "n1-l1-mirror",
  night: 1,
  order: 1,
  title: "El Espejo",
  poeticLine: "Antes de ver el mundo, aprendemos a mirarnos.",
  stars: starsFromShape(MIRROR_SHAPE, "white"),
  blackHoles: [],
  twinMode: false,
  trailColor: "#5ce1ff",
  glow: "#bfeaff",
  instrument: "harp",
  shapeIds: ["mirror"],
  mechanicHint: "Mueve tu Chispa y une las estrellas sin cruzar tu propia luz.",
};

const level2_eye: LevelDef = {
  id: "n1-l2-eye",
  night: 1,
  order: 2,
  title: "El Ojo que Despierta",
  poeticLine: "Aprender a mirar hacia adentro es el primer viaje.",
  stars: starsFromShape(EYE_SHAPE, "white"),
  blackHoles: [],
  twinMode: false,
  trailColor: "#5ce1ff",
  glow: "#bfeaff",
  instrument: "harp",
  shapeIds: ["eye"],
  mechanicHint: "El camino se hace más largo. Respira y traza con calma.",
};

// ---------- NIGHT 2: Estrellas Fugaces ----------
const level3_bird: LevelDef = {
  id: "n2-l1-bird",
  night: 2,
  order: 1,
  title: "El Vuelo",
  poeticLine: "A veces hay que moverse para encontrar el momento justo.",
  stars: starsFromShape(BIRD_SHAPE, "white", {
    movementFor: (i) =>
      i % 2 === 0
        ? { type: "circle", radius: 0.035, speed: 0.4 + i * 0.05, phase: i }
        : { type: "static" },
  }),
  blackHoles: [],
  twinMode: false,
  trailColor: "#ffc9a8",
  glow: "#ffe3cc",
  instrument: "piano",
  shapeIds: ["bird"],
  mechanicHint: "Algunas estrellas se mueven. Calcula el momento para tocarlas.",
};

// ---------- NIGHT 3: Agujeros Negros ----------
const level4_tree: LevelDef = {
  id: "n3-l1-tree",
  night: 3,
  order: 1,
  title: "El Árbol de la Vida",
  poeticLine: "Incluso lo que nos atrae hacia abajo nos ayuda a crecer raíces.",
  stars: starsFromShape(TREE_SHAPE, "white"),
  blackHoles: [
    { x: 0.5, y: 0.55, radius: 0.16, strength: 0.55 },
    { x: 0.28, y: 0.3, radius: 0.09, strength: 0.3 },
  ],
  twinMode: false,
  trailColor: "#7effc7",
  glow: "#c9ffe6",
  instrument: "xylophone",
  shapeIds: ["tree"],
  mechanicHint: "Los vórtices curvan tu camino. Resiste suavemente su gravedad.",
};

// ---------- NIGHT 4: Estrellas Gemelas ----------
const level5_hands: LevelDef = {
  id: "n4-l1-hands",
  night: 4,
  order: 1,
  title: "Manos Entrelazadas",
  poeticLine: "Aceptar las dos partes de ti es también un acto de amor.",
  stars: [
    ...starsFromShape(HAND_PINK_SHAPE, "pink"),
    ...starsFromShape(HAND_BLUE_SHAPE, "blue"),
  ],
  blackHoles: [],
  twinMode: true,
  trailColor: "#ff8fd8",
  trailColorSecondary: "#7ec8ff",
  glow: "#ffe1f6",
  instrument: "harp",
  shapeIds: ["hand-pink", "hand-blue"],
  mechanicHint: "Controlas dos chispas espejadas. Cada una solo puede tocar su propio color.",
};

// ---------- NIGHT 5: El Corazón ----------
const level6_heart: LevelDef = {
  id: "n5-l1-heart",
  night: 5,
  order: 1,
  title: "El Corazón",
  poeticLine: "Quererte a ti mismo también se mueve, también tropieza, y aun así late.",
  stars: starsFromShape(HEART_SHAPE, "white", {
    movementFor: (i) =>
      i % 3 === 0
        ? { type: "circle", radius: 0.03, speed: 0.35 + i * 0.03, phase: i * 1.3 }
        : { type: "static" },
  }),
  blackHoles: [{ x: 0.5, y: 0.5, radius: 0.1, strength: 0.28 }],
  twinMode: false,
  trailColor: "#c9a6ff",
  glow: "#ecd9ff",
  instrument: "piano",
  shapeIds: ["heart"],
  mechanicHint: "Todo lo aprendido se une. Muévete con confianza.",
};

// ---------- NIGHT 6: La Gema ----------
const level7_gem: LevelDef = {
  id: "n6-l1-gem",
  night: 6,
  order: 1,
  title: "La Gema Brillante",
  poeticLine: "Lo que temías mostrar siempre fue lo que más brillaba.",
  stars: starsFromShape(GEM_SHAPE, "white"),
  blackHoles: [{ x: 0.22, y: 0.65, radius: 0.1, strength: 0.25 }],
  twinMode: false,
  trailColor: "#ffe9a8",
  glow: "#fff6da",
  instrument: "xylophone",
  shapeIds: ["gem"],
  mechanicHint: "El último tramo del camino. Confía en tu propia luz.",
};

export const NIGHTS: NightDef[] = [
  {
    night: 1,
    title: "El Despertar",
    subtitle: "Aprende a moverte sin perderte en ti mismo.",
    levels: [level1_mirror, level2_eye],
  },
  {
    night: 2,
    title: "Estrellas Fugaces",
    subtitle: "El tiempo y el movimiento entran en juego.",
    levels: [level3_bird],
  },
  {
    night: 3,
    title: "Agujeros Negros",
    subtitle: "No todo lo que atrae debe controlarte.",
    levels: [level4_tree],
  },
  {
    night: 4,
    title: "Estrellas Gemelas",
    subtitle: "Dos partes de ti, un mismo camino.",
    levels: [level5_hands],
  },
  {
    night: 5,
    title: "El Corazón",
    subtitle: "Amarte también es un viaje que se mueve.",
    levels: [level6_heart],
  },
  {
    night: 6,
    title: "La Gema",
    subtitle: "El final de un bello camino... por ahora.",
    levels: [level7_gem],
  },
];

export const ALL_LEVELS: LevelDef[] = NIGHTS.flatMap((n) => n.levels);

export function getLevelById(id: string): LevelDef | undefined {
  return ALL_LEVELS.find((l) => l.id === id);
}

export function getNextLevelId(id: string): string | null {
  const idx = ALL_LEVELS.findIndex((l) => l.id === id);
  if (idx === -1 || idx === ALL_LEVELS.length - 1) return null;
  return ALL_LEVELS[idx + 1].id;
}
