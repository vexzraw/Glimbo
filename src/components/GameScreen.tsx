import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCanvas } from "./GameCanvas";
import { WinOverlay } from "./WinOverlay";
import { getLevelById, getNextLevelId } from "../lib/levels";
import { useGameStore } from "../store/useGameStore";
import { audioEngine } from "../lib/audioEngine";
import { BackArrow, GearIcon } from "./icons/Icons";
import { ClickButton } from "./ClickButton";

export function GameScreen({ boostRef }: { boostRef: React.RefObject<number> }) {
  const activeLevelId = useGameStore((s) => s.activeLevelId);
  const startLevel = useGameStore((s) => s.startLevel);
  const completeLevel = useGameStore((s) => s.completeLevel);
  const goTo = useGameStore((s) => s.goTo);
  const toggleSettings = useGameStore((s) => s.toggleSettings);

  const level = activeLevelId ? getLevelById(activeLevelId) : undefined;
  const [showWin, setShowWin] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [runKey, setRunKey] = useState(0);
  const noop = useCallback(() => {}, []);

  useEffect(() => {
    setShowWin(false);
    setShowHint(true);
    setRunKey((k) => k + 1);
    const t = setTimeout(() => setShowHint(false), 5200);
    audioEngine.startAmbientPad(["C3", "G3", "D4"]);
    return () => {
      clearTimeout(t);
      audioEngine.stopAmbientPad();
    };
  }, [activeLevelId]);

  if (!level) return null;

  const nextId = getNextLevelId(level.id);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <GameCanvas
        key={runKey}
        level={level}
        boostRef={boostRef}
        onLevelComplete={() => {
          completeLevel(level.id);
          setShowWin(true);
        }}
        onFailure={noop}
      />

      {/* top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5 sm:px-8">
        <ClickButton
          onClick={() => goTo("nights")}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-md transition hover:bg-white/15"
          aria-label="Volver"
        >
          <BackArrow className="h-5 w-5" />
        </ClickButton>
        <div className="pointer-events-none text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Noche {level.night}</p>
          <h1 className="text-sm font-light tracking-wide text-white/85">{level.title}</h1>
        </div>
        <ClickButton
          onClick={() => toggleSettings(true)}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-md transition hover:bg-white/15"
          aria-label="Configuración"
        >
          <GearIcon className="h-5 w-5" />
        </ClickButton>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center px-6"
          >
            <p className="rounded-full bg-black/25 px-5 py-2 text-center text-xs tracking-wide text-white/70 backdrop-blur-sm">
              {level.mechanicHint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWin && (
          <WinOverlay
            level={level}
            hasNext={!!nextId}
            onNext={() => {
              if (nextId) startLevel(nextId);
            }}
            onNights={() => goTo("nights")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
