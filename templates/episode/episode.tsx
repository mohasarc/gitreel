import React from "react";
import { BigText, TitleCard, type EpisodeDefinition, type SceneSpec } from "gitreel/engine";

const scenes: SceneSpec[] = [
  {
    id: "cold-open",
    sfx: "whoosh.wav",
    element: (
      <TitleCard chip="your repo · PR #0" words={["hello", "gitreel"]} subtitle="a freshly scaffolded episode" />
    ),
  },
  {
    id: "goal",
    sfx: "pop.wav",
    element: (
      <BigText
        emoji="🎬"
        text="replace these scenes with your story"
        sub="import scene primitives from gitreel/engine"
      />
    ),
  },
];

const episode: EpisodeDefinition = {
  id: "EPISODE_ID",
  music: "drive.wav",
  musicVolume: 0.11,
  scenes,
};

export default episode;
