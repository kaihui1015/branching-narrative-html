import { useEffect, useMemo, useState } from "react";
import {
  back,
  choose,
  clearSaved,
  initialState,
  loadState,
  saveState,
  visibleCards,
  type StoryData,
  type StoryState,
} from "@/lib/story-engine";
import { StoryCard } from "./StoryCard";

type Props = { story: StoryData };

export function StoryPlayer({ story }: Props) {
  const [state, setState] = useState<StoryState>(() => initialState(story));
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState(story);
    if (saved) setState(saved);
    setHydrated(true);
  }, [story]);

  useEffect(() => {
    if (hydrated) saveState(story, state);
  }, [story, state, hydrated]);

  const scene = story.scenes[state.sceneId];
  const cards = useMemo(() => visibleCards(scene, state.vars), [scene, state.vars]);

  const isEnding = !scene.cards || scene.cards.length === 0 || Boolean(scene.final);

  const onChoose = (i: number) => {
    if (chosenIndex !== null) return;
    setChosenIndex(i);
    // Wait for flip + read time before advancing.
    window.setTimeout(() => {
      setState((s) => choose(story, s, i));
      setChosenIndex(null);
    }, 3200);
  };

  const onBack = () => {
    setChosenIndex(null);
    setState((s) => back(s));
  };

  const onRestart = () => {
    clearSaved(story);
    setChosenIndex(null);
    setState(initialState(story));
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col gap-10 px-6 py-12">
      {isEnding ? (
        <div className="animate-fade-in flex flex-1 flex-col items-center justify-center text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            The end
          </div>
          <p className="mt-6 max-w-xl font-serif text-2xl leading-relaxed text-foreground">
            {scene.final ?? "The story ends here."}
          </p>
        </div>
      ) : (
        <>
          <div key={state.sceneId} className="animate-fade-in text-center">
            <p className="font-serif text-xl leading-relaxed text-foreground md:text-2xl">
              {scene.prompt}
            </p>
          </div>

          <div className="story-card-grid" data-count={cards.length}>
            {cards.map((c, i) => (
              <StoryCard
                key={`${state.sceneId}-${i}`}
                label={c.label}
                reveal={c.reveal}
                index={i}
                total={cards.length}
                state={
                  chosenIndex === null
                    ? "idle"
                    : chosenIndex === i
                      ? "chosen"
                      : "dismissed"
                }
                onChoose={() => onChoose(i)}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-auto flex items-center justify-center gap-3 pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={state.history.length === 0 || chosenIndex !== null}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
