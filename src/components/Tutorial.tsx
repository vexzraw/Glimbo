import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { StarGlyph, SparkDot } from "./icons/Icons";
import { ClickButton } from "./ClickButton";

const STEPS = [
  {
    title: "Tu Chispa",
    text: "Mantén presionado en la pantalla para mover tu Chispa de luz. Se mueve suave, como si flotara en agua.",
    icon: "spark",
  },
  {
    title: "La Estrella Casa",
    text: "Toca la estrella que parpadea para despertarla. Al hacerlo, revelará el camino hacia las demás estrellas.",
    icon: "home",
  },
  {
    title: "La Estela de Luz",
    text: "Tu Chispa deja una estela permanente. Une todas las estrellas... pero nunca vuelvas a cruzar tu propia luz.",
    icon: "trail",
  },
  {
    title: "Si el hilo se rompe",
    text: "No pasa nada. Sonará una campana suave y podrás intentarlo de nuevo al instante. No hay vidas, no hay prisa.",
    icon: "bell",
  },
  {
    title: "El Cierre de Noche",
    text: "Al conectar todas las estrellas, el dibujo oculto despertará con música y color, y volará a tu Firmamento.",
    icon: "gem",
  },
];

export function Tutorial() {
  const goTo = useGameStore((s) => s.goTo);
  const setSeenTutorial = useGameStore((s) => s.setSeenTutorial);
  const [step, setStep] = useState(0);

  function finish() {
    setSeenTutorial(true);
    goTo("nights");
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
      <div className="glimbo-panel w-full max-w-md rounded-3xl px-8 py-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.4 }}
            >
              {STEPS[step].icon === "trail" ? (
                <svg viewBox="0 0 40 40" className="h-14 w-14">
                  <path d="M6 30 Q 16 6, 34 14" stroke="#5ce1ff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
                  <circle cx="34" cy="14" r="4" fill="#fff" />
                </svg>
              ) : (
                <SparkDot className="h-14 w-14 animate-glimbo-twinkle" color={step === 3 ? "#ff9d9d" : "#bfeaff"} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35 }}
          >
            <h2 className="text-lg font-light tracking-wide text-white/90">{STEPS[step].title}</h2>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/60">{STEPS[step].text}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-white/80" : "w-1.5 bg-white/25"}`} />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <ClickButton
            onClick={finish}
            className="text-xs tracking-wide text-white/40 transition hover:text-white/70"
          >
            Omitir
          </ClickButton>
          <ClickButton
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-300/80 to-fuchsia-200/70 px-6 py-2.5 text-sm font-medium tracking-wide text-[#1a1330] transition hover:brightness-110"
          >
            {isLast ? (
              <>
                <StarGlyph className="h-4 w-4" /> Comenzar mi viaje
              </>
            ) : (
              "Siguiente"
            )}
          </ClickButton>
        </div>
      </div>
    </div>
  );
}
