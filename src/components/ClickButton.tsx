import { useCallback, type ButtonHTMLAttributes } from "react";
import { audioEngine } from "../lib/audioEngine";

/**
 * Drop-in replacement for <button> that emits a soft UI click sound on
 * pointer down (so the sound is as tight as possible to the visual press).
 *
 * The click also unlocks the AudioContext on first interaction — useful
 * because the user might land directly on a settings panel without ever
 * having pressed the main "start" button.
 *
 * Pass `silent` if you want to opt out for a specific button (e.g. a
 * button whose onClick already triggers an obvious audio cue).
 */
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  silent?: boolean;
};

export function ClickButton({ silent, onClick, onPointerDown, ...rest }: Props) {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!silent) {
        // Fire-and-forget; first call may also resume the AudioContext.
        audioEngine.clickWithUnlock();
      }
      onPointerDown?.(e);
    },
    [silent, onPointerDown]
  );

  return <button {...rest} onPointerDown={handlePointerDown} onClick={onClick} />;
}
