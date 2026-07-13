import { motion } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { audioEngine } from "../lib/audioEngine";
import { StarGlyph, GearIcon } from "./icons/Icons";
import { FirmamentPreview } from "./FirmamentPreview";
import { MenuMusicControl } from "./MenuMusicControl";
import { ClickButton } from "./ClickButton";

export function MainMenu() {
  const goTo = useGameStore((s) => s.goTo);
  const seenTutorial = useGameStore((s) => s.seenTutorial);
  const toggleSettings = useGameStore((s) => s.toggleSettings);
  const completedLevels = useGameStore((s) => s.completedLevels);

  async function handleStart() {
    await audioEngine.unlock();
    goTo(seenTutorial ? "nights" : "tutorial");
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <FirmamentPreview completedLevels={completedLevels} />

      <ClickButton
        onClick={() => toggleSettings(true)}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-md transition hover:bg-white/15 sm:right-8 sm:top-8"
        aria-label="Configuración"
      >
        <GearIcon className="h-5 w-5" />
      </ClickButton>

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="animate-glimbo-title glimbo-shimmer-text text-5xl font-light tracking-[0.35em] sm:text-6xl"
      >
        GLIMBO
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="mt-3 max-w-sm text-xs font-light tracking-[0.15em] text-white/50 sm:text-sm"
      >
        Un viaje a través de la luz
      </motion.p>

      <ClickButton
        onClick={handleStart}
        className="group relative my-16 flex h-36 w-36 items-center justify-center focus:outline-none sm:h-44 sm:w-44"
        aria-label="Toca para comenzar tu viaje"
      >
        <span className="absolute inset-0 animate-glimbo-pulse-soft rounded-full bg-indigo-200/10 blur-2xl" />
        <StarGlyph className="animate-glimbo-float h-full w-full transition group-active:scale-90" />
      </ClickButton>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="animate-glimbo-pulse-soft text-sm font-light tracking-wide text-white/70"
      >
        Toca para comenzar tu viaje.
      </motion.p>

      <MenuMusicControl />
    </div>
  );
}
