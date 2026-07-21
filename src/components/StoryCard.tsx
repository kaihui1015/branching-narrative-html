import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  reveal: string;
  index: number;
  total: number;
  state: "idle" | "chosen" | "dismissed";
  onChoose: () => void;
};

export function StoryCard({ label, reveal, index, total, state, onChoose }: Props) {
  const [typed, setTyped] = useState("");
  const rafRef = useRef<number | null>(null);

  // Fan rotation for wider screens; centered stack becomes fan on md+.
  const mid = (total - 1) / 2;
  const offset = index - mid;
  const rotate = state === "chosen" ? 0 : offset * 4;
  const translateY = state === "chosen" ? 0 : Math.abs(offset) * 6;
  const translateX = state === "chosen" ? 0 : offset * 8;

  useEffect(() => {
    if (state !== "chosen") {
      setTyped("");
      return;
    }
    let i = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      if (dt > 18) {
        i = Math.min(i + Math.max(1, Math.floor(dt / 18)), reveal.length);
        setTyped(reveal.slice(0, i));
        last = now;
      }
      if (i < reveal.length) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state, reveal]);

  const skip = () => setTyped(reveal);

  return (
    <div
      className={cn(
        "story-card-wrap transition-all duration-500 ease-out",
        state === "dismissed" && "opacity-0 pointer-events-none",
        state === "chosen" && "z-10",
      )}
      style={{
        transform:
          state === "chosen"
            ? "translate(0,0) rotate(0deg) scale(1.02)"
            : `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`,
      }}
    >
      <button
        type="button"
        onClick={state === "chosen" ? skip : onChoose}
        disabled={state === "dismissed"}
        aria-label={state === "chosen" ? "Reveal text" : `Choose: ${label}`}
        className={cn(
          "story-card group relative block w-full text-left",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl",
        )}
      >
        <div
          className={cn(
            "story-card-inner",
            state === "chosen" && "is-flipped",
          )}
        >
          <div className="story-card-face story-card-front">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Card {index + 1}
            </div>
            <div className="mt-auto">
              <div className="text-lg font-medium leading-snug text-foreground">
                {label}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Tap to reveal
              </div>
            </div>
          </div>
          <div className="story-card-face story-card-back">
            <p className="text-[15px] leading-relaxed text-foreground font-serif">
              {typed}
              {typed.length < reveal.length && (
                <span className="ml-0.5 inline-block w-[2px] h-[1em] align-[-0.15em] bg-foreground/70 animate-pulse" />
              )}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
