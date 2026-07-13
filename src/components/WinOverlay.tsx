import { motion } from "framer-motion";
import type { LevelDef } from "../lib/types";
import { StarGlyph } from "./icons/Icons";
import { ClickButton } from "./ClickButton";

export function WinOverlay({
  level,
  hasNext,
  onNext,
  onNights,
}: {
  level: LevelDef;
  hasNext: boolean;
  onNext: () => void;
  onNights: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-[#05040d]/50 px-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="glimbo-panel w-full max-w-md rounded-3xl px-8 py-10 text-center"
      >
        <StarGlyph className="mx-auto mb-4 h-12 w-12 animate-glimbo-twinkle" />
        <h2 className="glimbo-shimmer-text text-2xl font-light tracking-wide">{level.title}</h2>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/70">{level.poeticLine}</p>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/40">
          se sumó a tu firmamento
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {hasNext && (
            <ClickButton
              onClick={onNext}
              className="rounded-full bg-gradient-to-r from-indigo-400/80 to-fuchsia-300/70 px-6 py-3 text-sm font-medium tracking-wide text-[#1a1330] shadow-lg shadow-indigo-500/20 transition hover:brightness-110"
            >
              Continuar el viaje
            </ClickButton>
          )}
          <ClickButton
            onClick={onNights}
            className="rounded-full border border-white/20 px-6 py-3 text-sm tracking-wide text-white/80 transition hover:bg-white/10"
          >
            Volver a las Noches
          </ClickButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
