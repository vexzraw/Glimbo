import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Starfield } from "./components/Starfield";
import { MainMenu } from "./components/MainMenu";
import { Tutorial } from "./components/Tutorial";
import { NightSelect } from "./components/NightSelect";
import { GameScreen } from "./components/GameScreen";
import { SettingsModal } from "./components/SettingsModal";
import { useGameStore } from "./store/useGameStore";

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const boostRef = useRef(0);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05040d] text-white">
      <Starfield boostRef={boostRef} />

      <AnimatePresence mode="wait">
        {screen === "menu" && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <MainMenu />
          </motion.div>
        )}
        {screen === "tutorial" && (
          <motion.div key="tutorial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Tutorial />
          </motion.div>
        )}
        {screen === "nights" && (
          <motion.div key="nights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <NightSelect />
          </motion.div>
        )}
        {screen === "game" && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <GameScreen boostRef={boostRef} />
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal />
    </div>
  );
}
