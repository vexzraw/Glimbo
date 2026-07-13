import type { Point } from "./smoothPath";

/**
 * Hand authored silhouettes, normalized to a 0..1 x 0..1 space.
 * These are used both to place stars in the sky and to draw the
 * final "reveal" artwork once a level is completed.
 */

export type ShapeDef = {
  id: string;
  name: string;
  points: Point[];
  closed: boolean;
  /** subset of point indices (into `points`) used as interactive stars */
  starIndices: number[];
  viewBoxPad?: number;
};

const P = (x: number, y: number): Point => ({ x, y });

export const MIRROR_SHAPE: ShapeDef = {
  id: "mirror",
  name: "El Espejo",
  closed: true,
  points: [
    P(0.5, 0.12), P(0.68, 0.17), P(0.8, 0.3), P(0.83, 0.46),
    P(0.76, 0.6), P(0.58, 0.68), P(0.58, 0.86), P(0.5, 0.92),
    P(0.42, 0.86), P(0.42, 0.68), P(0.24, 0.6), P(0.17, 0.46),
    P(0.2, 0.3), P(0.32, 0.17),
  ],
  starIndices: [0, 2, 4, 6, 8, 10, 12],
};

export const EYE_SHAPE: ShapeDef = {
  id: "eye",
  name: "El Ojo",
  closed: true,
  points: [
    P(0.08, 0.5), P(0.24, 0.28), P(0.5, 0.16), P(0.76, 0.28),
    P(0.92, 0.5), P(0.76, 0.72), P(0.5, 0.84), P(0.24, 0.72),
  ],
  starIndices: [0, 1, 2, 3, 4, 5, 6, 7],
};

export const BIRD_SHAPE: ShapeDef = {
  id: "bird",
  name: "El Pájaro",
  closed: true,
  points: [
    P(0.04, 0.55), P(0.26, 0.28), P(0.5, 0.46), P(0.74, 0.28),
    P(0.96, 0.55), P(0.74, 0.42), P(0.5, 0.6), P(0.26, 0.42),
  ],
  starIndices: [0, 1, 2, 3, 4, 5, 6, 7],
};

export const TREE_SHAPE: ShapeDef = {
  id: "tree",
  name: "El Árbol de la Vida",
  closed: true,
  points: [
    P(0.42, 0.95), P(0.46, 0.66), P(0.18, 0.56), P(0.27, 0.24),
    P(0.5, 0.1), P(0.73, 0.24), P(0.82, 0.56), P(0.54, 0.66),
    P(0.58, 0.95), P(0.5, 0.84),
  ],
  starIndices: [0, 2, 4, 6, 8, 9],
};

export const HEART_SHAPE: ShapeDef = {
  id: "heart",
  name: "El Corazón",
  closed: true,
  points: [
    P(0.5, 0.32), P(0.38, 0.16), P(0.16, 0.2), P(0.08, 0.42),
    P(0.18, 0.62), P(0.5, 0.9), P(0.82, 0.62), P(0.92, 0.42),
    P(0.84, 0.2), P(0.62, 0.16),
  ],
  starIndices: [0, 1, 3, 5, 7, 9],
};

export const GEM_SHAPE: ShapeDef = {
  id: "gem",
  name: "La Gema",
  closed: true,
  points: [
    P(0.3, 0.16), P(0.5, 0.08), P(0.7, 0.16), P(0.86, 0.32),
    P(0.65, 0.56), P(0.5, 0.94), P(0.35, 0.56), P(0.14, 0.32),
  ],
  starIndices: [0, 1, 2, 3, 5, 6, 7],
};

/** Twin hands — two separate silhouettes, pink (left) and blue (right) */
export const HAND_PINK_SHAPE: ShapeDef = {
  id: "hand-pink",
  name: "Mano Rosa",
  closed: true,
  points: [
    P(0.14, 0.82), P(0.08, 0.56), P(0.18, 0.3), P(0.44, 0.16),
    P(0.56, 0.34), P(0.4, 0.5), P(0.5, 0.68), P(0.3, 0.78),
  ],
  starIndices: [0, 2, 3, 4, 6],
};

export const SHAPES_BY_ID: Record<string, ShapeDef> = {};

export const HAND_BLUE_SHAPE: ShapeDef = {
  id: "hand-blue",
  name: "Mano Azul",
  closed: true,
  points: [
    P(0.86, 0.82), P(0.92, 0.56), P(0.82, 0.3), P(0.56, 0.16),
    P(0.44, 0.34), P(0.6, 0.5), P(0.5, 0.68), P(0.7, 0.78),
  ],
  starIndices: [0, 2, 3, 4, 6],
};

Object.assign(SHAPES_BY_ID, {
  mirror: MIRROR_SHAPE,
  eye: EYE_SHAPE,
  bird: BIRD_SHAPE,
  tree: TREE_SHAPE,
  heart: HEART_SHAPE,
  gem: GEM_SHAPE,
  "hand-pink": HAND_PINK_SHAPE,
  "hand-blue": HAND_BLUE_SHAPE,
});
