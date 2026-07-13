import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audioEngine } from "../lib/audioEngine";
import { useGameStore } from "../store/useGameStore";
import { ClickButton } from "./ClickButton";

/**
 * Discreet button on the main menu that lets the user load an MP3
 * file to be used as menu background music. When a track is loaded,
 * it loops softly behind the procedural SFX.
 */
export function MenuMusicControl() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const menuMusicEnabled = useGameStore((s) => s.settings.menuMusicEnabled);
  const setMenuMusicEnabled = useGameStore((s) => s.setMenuMusicEnabled);

  async function handleFile(file: File) {
    setErrorMsg(null);
    if (!file.type.startsWith("audio/") && !/\.(mp3|ogg|wav|m4a|aac|flac)$/i.test(file.name)) {
      setErrorMsg("Por favor selecciona un archivo de audio (MP3, OGG, WAV).");
      return;
    }
    setLoading(true);
    try {
      await audioEngine.unlock();
    } catch { /* ignore */ }
    const ok = await audioEngine.loadMenuMusicFile(file);
    setLoading(false);
    if (ok) {
      setFileName(file.name.replace(/\.[^.]+$/, ""));
      audioEngine.startMenuMusic();
      setMenuMusicEnabled(true);
    } else {
      setErrorMsg("No se pudo cargar el audio. Prueba con MP3 u OGG.");
    }
  }

  function toggleMusic() {
    if (menuMusicEnabled) {
      audioEngine.stopMenuMusic();
      setMenuMusicEnabled(false);
    } else {
      audioEngine.startMenuMusic();
      setMenuMusicEnabled(true);
    }
  }

  async function removeMusic() {
    await audioEngine.unloadMenuMusic();
    setFileName(null);
    setMenuMusicEnabled(false);
    setShowPanel(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-8 sm:right-8">
      <ClickButton
        onClick={() => setShowPanel((p) => !p)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 backdrop-blur-md transition hover:bg-white/15"
        title={fileName ? `Música: ${fileName}` : "Poner música del menú"}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 18V6l11-2v12" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
        </svg>
      </ClickButton>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="glimbo-panel absolute bottom-14 right-0 w-72 rounded-2xl p-5"
          >
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/40">Música del menú</p>

            {errorMsg && (
              <p className="mb-3 rounded-lg border border-red-300/30 bg-red-500/10 px-3 py-2 text-[11px] leading-relaxed text-red-200">
                {errorMsg}
              </p>
            )}

            {!fileName ? (
              <>
                <p className="mb-3 text-xs leading-relaxed text-white/55">
                  Sube un archivo MP3, OGG o WAV para que suene de fondo en el menú mientras juegas.
                </p>
                <ClickButton
                  onClick={() => inputRef.current?.click()}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-300/80 to-fuchsia-200/70 py-2.5 text-sm font-medium text-[#1a1330] transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? "Cargando…" : "Seleccionar archivo"}
                </ClickButton>
              </>
            ) : (
              <>
                <p className="mb-3 truncate text-sm text-white/80" title={fileName}>
                  🎵 {fileName}
                </p>
                <div className="flex gap-2">
                  <ClickButton
                    onClick={toggleMusic}
                    className="flex-1 rounded-full bg-white/10 py-2 text-xs tracking-wide text-white/80 transition hover:bg-white/20"
                  >
                    {menuMusicEnabled ? "Pausar" : "Reproducir"}
                  </ClickButton>
                  <ClickButton
                    onClick={removeMusic}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/50 transition hover:border-red-300/30 hover:text-red-200/80"
                  >
                    Quitar
                  </ClickButton>
                </div>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="audio/*,.mp3,.ogg,.wav,.m4a,.aac,.flac"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
