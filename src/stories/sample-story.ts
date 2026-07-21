import type { StoryData } from "@/lib/story-engine";

export const sampleStory: StoryData = {
  id: "sample",
  start: "s1",
  vars: { mood: 0 },
  scenes: {
    s1: {
      prompt: "You stand at a crossroads at dusk. What draws your eye?",
      cards: [
        {
          label: "The lantern",
          reveal:
            "You lift the lantern from its hook. Warm light pools around your boots, and the road ahead sheds its shadows one step at a time.",
          next: "s2",
          set: { mood: 1 },
        },
        {
          label: "The letter",
          reveal:
            "The paper is folded once, sealed with wax. The ink is still wet — someone left it for you moments ago.",
          next: "s2",
        },
        {
          label: "The key",
          reveal:
            "Cold iron, heavier than it should be. It fits no lock you have seen, but your fingers know its shape.",
          next: "s2",
        },
        {
          label: "The mirror",
          reveal:
            "Your reflection blinks a half-second late. When you smile, it hesitates before smiling back.",
          next: "s2",
        },
        {
          label: "The silence",
          reveal:
            "You choose to listen instead of look. Something in the dark listens with you, patient and unhurried.",
          next: "s2",
        },
      ],
    },
    s2: {
      prompt: "A door appears at the edge of the clearing. How do you approach it?",
      cards: [
        {
          label: "Knock softly",
          reveal:
            "Three quiet raps. The door opens on its own, revealing a room that recognizes you.",
          next: "end",
        },
        {
          label: "Listen first",
          reveal:
            "Footsteps inside, then quiet. You wait until the quiet feels like an invitation.",
          next: "end",
        },
        {
          label: "Step through",
          reveal:
            "You do not hesitate. The doorway breathes you in and gives you back to yourself, changed.",
          next: "end",
          if: "mood >= 1",
        },
      ],
    },
    end: {
      final:
        "The story remembers the shape you gave it. Somewhere, a lantern is still burning for you. Thank you for playing.",
    },
  },
};
