import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { audioEngine } from "../lib/audioEngine";
import { CloseIcon, VolumeIcon } from "./icons/Icons";
import { ClickButton } from "./ClickButton";

const WRITTEN_TUTORIAL = [
  "Mantén presionado sobre la pantalla para mover tu Chispa. Suéltala y flotará hasta detenerse suavemente.",
  "Cada noche comienza con tu Chispa y una Estrella Casa parpadeando. Tócala para revelar el resto del camino.",
  "Une todas las estrellas en el orden que quieras. Tu Chispa deja una Estela de Luz permanente detrás de ella.",
  "Si tu Chispa toca su propia estela, el hilo se rompe: sonará una campana suave y el nivel se reinicia al instante.",
  "Algunas noches introducen movimiento, vórtices de gravedad o dos chispas gemelas. Cada mecánica se explica sola al jugar.",
  "Al completar una noche, el dibujo oculto se revela con color y música, y vuela hacia tu Firmamento en el menú principal.",
];

export function SettingsModal() {
  const open = useGameStore((s) => s.settingsOpen);
  const toggle = useGameStore((s) => s.toggleSettings);
  const settings = useGameStore((s) => s.settings);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const setSfxVolume = useGameStore((s) => s.setSfxVolume);
  const setMenuMusicEnabled = useGameStore((s) => s.setMenuMusicEnabled);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [menuTrackName, setMenuTrackName] = useState<string | null>(null);
  const [loadingMenuTrack, setLoadingMenuTrack] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleMenuFile(file: File) {
    setErrorMsg(null);
    if (!file.type.startsWith("audio/") && !/\.(mp3|ogg|wav|m4a|aac|flac)$/i.test(file.name)) {
      setErrorMsg("Por favor selecciona un archivo de audio (MP3, OGG, WAV).");
      return;
    }
    setLoadingMenuTrack(true);
    // Unlock inside the click-initiated chain so AudioContext is ready.
    try {
      await audioEngine.unlock();
    } catch { /* ignore */ }
    const ok = await audioEngine.loadMenuMusicFile(file);
    setLoadingMenuTrack(false);
    if (ok) {
      setMenuTrackName(file.name.replace(/\.[^.]+$/, ""));
      audioEngine.startMenuMusic();
      setMenuMusicEnabled(true);
    } else {
      setErrorMsg("No se pudo cargar el archivo de audio. Prueba con otro formato (MP3 u OGG).");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => toggle(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
            className="glimbo-scrollbar glimbo-panel max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl p-7 sm:p-9"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="glimbo-shimmer-text text-lg tracking-[0.25em]">GLIMBO</h2>
                <p className="text-xs text-white/40">Configuración y guía</p>
              </div>
              <ClickButton
                onClick={() => toggle(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10"
              >
                <CloseIcon className="h-4 w-4" />
              </ClickButton>
            </div>

            <section className="mb-7">
              <h3 className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">Sonido</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <VolumeIcon className="h-4 w-4 shrink-0" />
                  <span className="w-20 shrink-0">Música</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.musicVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setMusicVolume(v);
                      audioEngine.setMusicVolume(v);
                    }}
                    className="w-full accent-indigo-300"
                  />
                </label>
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <VolumeIcon className="h-4 w-4 shrink-0" />
                  <span className="w-20 shrink-0">Efectos</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.sfxVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setSfxVolume(v);
                      audioEngine.setSfxVolume(v);
                    }}
                    className="w-full accent-fuchsia-300"
                  />
                </label>
              </div>
            </section>

            <section className="mb-7">
              <h3 className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">Música del menú</h3>
              <p className="mb-3 text-xs leading-relaxed text-white/55">
                Sube tu propia canción (MP3, OGG, WAV) para que suene de fondo en el menú. Se reproducirá en loop.
              </p>
              {errorMsg && (
                <p className="mb-3 rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {errorMsg}
                </p>
              )}
              {menuTrackName ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 truncate rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
                    🎵 {menuTrackName}
                  </span>
                  <ClickButton
                    onClick={() => {
                      if (settings.menuMusicEnabled) {
                        audioEngine.stopMenuMusic();
                        setMenuMusicEnabled(false);
                      } else {
                        audioEngine.startMenuMusic();
                        setMenuMusicEnabled(true);
                      }
                    }}
                    className="rounded-full bg-white/10 px-4 py-2 text-xs tracking-wide text-white/80 transition hover:bg-white/20"
                  >
                    {settings.menuMusicEnabled ? "Pausar" : "Reproducir"}
                  </ClickButton>
                  <ClickButton
                    onClick={async () => {
                      await audioEngine.unloadMenuMusic();
                      setMenuTrackName(null);
                      setMenuMusicEnabled(false);
                    }}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/50 transition hover:border-red-300/30 hover:text-red-200/80"
                  >
                    Quitar
                  </ClickButton>
                </div>
              ) : (
                <ClickButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loadingMenuTrack}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-300/80 to-fuchsia-200/70 py-2.5 text-sm font-medium text-[#1a1330] transition hover:brightness-110 disabled:opacity-60"
                >
                  {loadingMenuTrack ? "Cargando…" : "Seleccionar archivo de audio"}
                </ClickButton>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.ogg,.wav,.m4a,.aac,.flac"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleMenuFile(f);
                  e.target.value = "";
                }}
              />
            </section>

            <section className="mb-7">
              <h3 className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">Acerca de Glimbo</h3>
              <p className="text-sm italic leading-relaxed text-white/70">
                “Glimbo es un juego artístico, abstracto y con narrativa ambiental. La historia se entiende por sí
                sola mientras te relajas jugando. Une los puntos, enciende el cielo y descubre la historia.”
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Un juego tranquilo sobre conectar estrellas y encontrarte a ti mismo. En Glimbo controlas a una
                pequeña chispa de luz en medio de la oscuridad. Tu único objetivo es moverte por la pantalla para
                unir estrellas flotantes y dibujar caminos brillantes. La regla es súper simple: muévete como
                quieras, pero no puedes chocar con la línea de luz que ya dejaste atrás.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Mientras juegas con una música muy suave y relajante de fondo, cada figura que logres armar
                revelará un dibujo en el cielo. Sin usar ni una sola palabra, estas formas te van a contar una
                historia muy linda y humana: el viaje de alguien que pasa de sentirse confundido y encerrado, a
                aceptarse por fin y ser libre de mostrarse al mundo tal como es.
              </p>
            </section>

            <section className="mb-7">
              <h3 className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">Cómo jugar</h3>
              <ol className="space-y-2.5 text-sm leading-relaxed text-white/65">
                {WRITTEN_TUTORIAL.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 text-white/30">{String(i + 1).padStart(2, "0")}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <ClickButton
                onClick={() => {
                  if (confirm("¿Reiniciar todo tu progreso y tu firmamento? Esta acción no se puede deshacer.")) {
                    resetProgress();
                  }
                }}
                className="w-full rounded-full border border-white/15 py-2.5 text-xs tracking-wide text-white/50 transition hover:border-red-300/30 hover:text-red-200/80"
              >
                Reiniciar progreso
              </ClickButton>
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
