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
  // Fan rotation for wider screens; centered stack becomes fan on md+.
  const mid = (total - 1) / 2;
  const offset = index - mid;
  const rotate = state === "chosen" ? 0 : offset * 4;
  const translateY = state === "chosen" ? 0 : Math.abs(offset) * 6;
  const translateX = state === "chosen" ? 0 : offset * 8;

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
            ? "translate(0,0) rotate(0deg) scale(1.35)"
            : `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`,
      }}
    >
      <button
        type="button"
        onClick={state === "chosen" ? undefined : onChoose}
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
              {reveal}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
