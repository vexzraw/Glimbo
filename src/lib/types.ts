export type Vec2 = { x: number; y: number };

export type StarColor = "white" | "pink" | "blue";

export type StarMovement =
  | { type: "static" }
  | { type: "circle"; radius: number; speed: number; phase: number }
  | { type: "line"; dx: number; dy: number; speed: number; phase: number };

export type LevelStar = {
  id: string;
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  color: StarColor;
  home?: boolean;
  movement: StarMovement;
};

export type BlackHole = {
  x: number;
  y: number;
  radius: number;
  strength: number;
};

export type Instrument = "harp" | "piano" | "xylophone";

export type LevelDef = {
  id: string;
  night: number;
  order: number;
  title: string;
  poeticLine: string;
  stars: LevelStar[];
  blackHoles: BlackHole[];
  twinMode: boolean;
  trailColor: string; // primary
  trailColorSecondary?: string; // for twin mode (blue)
  trailColorPrimary?: string; // for twin mode (pink) override
  glow: string;
  instrument: Instrument;
  shapeIds: string[]; // shapes rendered on reveal
  mechanicHint: string;
};

export type NightDef = {
  night: number;
  title: string;
  subtitle: string;
  levels: LevelDef[];
};
