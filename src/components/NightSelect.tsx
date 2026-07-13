import { motion } from "framer-motion";
import { NIGHTS } from "../lib/levels";
import { useGameStore, overallProgress, isGameComplete } from "../store/useGameStore";
import { BackArrow, GearIcon, LockIcon, PlayTriangle, StarGlyph } from "./icons/Icons";
import { ClickButton } from "./ClickButton";

function isNightUnlocked(nightIndex: number, completedLevels: Record<string, boolean>) {
  if (nightIndex === 0) return true;
  const prevNight = NIGHTS[nightIndex - 1];
  return prevNight.levels.every((l) => completedLevels[l.id]);
}

export function NightSelect() {
  const goTo = useGameStore((s) => s.goTo);
  const startLevel = useGameStore((s) => s.startLevel);
  const completedLevels = useGameStore((s) => s.completedLevels);
  const toggleSettings = useGameStore((s) => s.toggleSettings);

  const { done, total, pct } = overallProgress(completedLevels);
  const finished = isGameComplete(completedLevels);

  return (
    <div className="relative z-10 flex min-h-screen flex-col px-5 py-6 sm:px-10">
      <div className="flex items-center justify-between">
        <ClickButton
          onClick={() => goTo("menu")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-md transition hover:bg-white/15"
        >
          <BackArrow className="h-5 w-5" />
        </ClickButton>
        <h1 className="glimbo-shimmer-text text-xl font-light tracking-[0.2em]">LAS NOCHES</h1>
        <ClickButton
          onClick={() => toggleSettings(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-md transition hover:bg-white/15"
        >
          <GearIcon className="h-5 w-5" />
        </ClickButton>
      </div>

      <div className="mx-auto mt-6 w-full max-w-md">
        {finished ? (
          <p className="animate-glimbo-fade-in text-center text-sm italic leading-relaxed text-white/80">
            Has llegado al fin de este bello camino por ahora, ¡felicidades viajero!
          </p>
        ) : (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-300 via-fuchsia-200 to-amber-200 transition-all duration-700"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <p className="mt-2 text-center text-[11px] uppercase tracking-[0.3em] text-white/40">
              {done} / {total} estrellas del camino encendidas
            </p>
          </div>
        )}
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {NIGHTS.map((night, i) => {
          const unlocked = isNightUnlocked(i, completedLevels);
          const nightDone = night.levels.every((l) => completedLevels[l.id]);
          return (
            <motion.div
              key={night.night}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`glimbo-panel relative overflow-hidden rounded-3xl p-6 ${unlocked ? "" : "opacity-50"}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Noche {night.night}</span>
                {nightDone ? (
                  <StarGlyph className="h-5 w-5 animate-glimbo-pulse-soft" />
                ) : !unlocked ? (
                  <LockIcon className="h-4 w-4 text-white/40" />
                ) : null}
              </div>
              <h3 className="text-lg font-light text-white/90">{night.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/50">{night.subtitle}</p>

              <div className="mt-4 flex gap-2">
                {night.levels.map((lvl) => (
                  <span
                    key={lvl.id}
                    className={`h-1.5 flex-1 rounded-full ${completedLevels[lvl.id] ? "bg-white/80" : "bg-white/15"}`}
                  />
                ))}
              </div>

              <ClickButton
                disabled={!unlocked}
                onClick={() => unlocked && startLevel(night.levels[0].id)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white/10 py-2.5 text-xs font-medium tracking-wide text-white/85 transition enabled:hover:bg-white/20 disabled:cursor-not-allowed"
              >
                <PlayTriangle className="h-3.5 w-3.5" />
                {unlocked ? (nightDone ? "Revivir" : "Comenzar") : "Bloqueada"}
              </ClickButton>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
