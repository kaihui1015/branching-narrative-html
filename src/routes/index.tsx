import { createFileRoute } from "@tanstack/react-router";
import { StoryPlayer } from "@/components/StoryPlayer";
import { sampleStory } from "@/stories/sample-story";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Interactive Story Cards — Branching Narrative Template" },
      {
        name: "description",
        content:
          "A reusable HTML/CSS/JS template for interactive storytelling with flipping cards and branching choices.",
      },
      { property: "og:title", content: "Interactive Story Cards" },
      {
        property: "og:description",
        content:
          "Branching narrative template: prompt, cards that flip to reveal text, then the next set of choices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 pt-8">
        <div>
          <h1 className="text-sm font-medium tracking-tight text-foreground">
            Interactive Story Cards
          </h1>
          <p className="text-xs text-muted-foreground">
            A branching narrative template
          </p>
        </div>
        <a
          href="/story-cards.html"
          download
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Download template
        </a>
      </header>
      <main>
        <StoryPlayer story={sampleStory} />
      </main>
    </div>
  );
}
