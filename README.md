# gitreel 🎬

**Turn your pull requests into movie trailers.**

gitreel makes narrated, fast-paced, Fireship-style review videos out of GitHub PRs: animated
architecture diagrams, syntax-highlighted diff morphs, spotlit code close-ups, a local TTS
narrator with opinions, and a verdict card at the end. Your coding agent writes the screenplay;
gitreel renders the movie.

<!-- DEMO-VIDEO: drag-drop out/zod-5898.mp4 here in the GitHub editor so it gets a hosted player URL -->
> 🎥 demo: gitreel reviewing [zod#5898](https://github.com/colinhacks/zod/pull/5898) — a prototype-pollution fix ([video](assets/demo/zod-5898.mp4))

## How it works

gitreel is two pieces:

1. **The `gitreel` CLI** (this package) — the render engine. Remotion-based scene primitives,
   Kokoro-82M local TTS, synthesized music/SFX, and a workspace where episodes live. No cloud,
   no API keys: narration, rendering, everything runs on your machine.
2. **The `gitreel` agent skill** — instructions that teach any coding agent (Claude Code, Cursor,
   Codex, opencode, …) to read a PR, write the screenplay (narration + scene composition), and
   drive the CLI. The agent is the writer-director; the CLI is the camera crew.

## Install

```sh
# 1. the engine
npm i -g gitreel
gitreel doctor          # checks node ≥ 20, gh auth, render browser

# 2. the skill (via skills.sh, into your agent's skills)
npx skills add mohasarc/gitreel
```

Then, in your agent of choice, from any repo:

```
/gitreel 5898                       # short video for PR #5898
/gitreel 5898 long                  # full walkthrough
/gitreel 5898 --review review.md    # weave your review's findings into the video
```

The agent checks for the engine and installs it if missing — so honestly, step 2 alone works.

## CLI

The skill drives these, but they're yours too:

```sh
gitreel new <id>                # scaffold an episode (episode.tsx + narration.json)
gitreel narrate <id>            # local TTS → per-scene WAVs + duration manifest
gitreel still <id> --frame 120  # render one frame (cheap visual check)
gitreel render <id> [--draft]   # render the MP4
gitreel preview <id>            # open Remotion Studio for live editing
gitreel where                   # print the workspace (default ~/gitreel, GITREEL_HOME to move)
gitreel doctor                  # environment checks
```

Episodes are plain TSX files in your workspace that import scene primitives from
`gitreel/engine` — `TitleCard`, `DiagramScene`, `DiffMorph`, `CodeScene`, `TerminalScene`,
`FileTreeScene`, `VerdictCard`, and friends. The narration manifest drives scene durations, so
audio and visuals never drift. Keep your workspace under git; episodes are re-renderable forever.

## Licensing notes

- **gitreel is MIT.**
- **Remotion** (the render engine underneath) is source-available, **not** MIT: free for
  individuals and companies of up to 3 people; larger companies need a
  [Remotion company license](https://www.remotion.dev/license) to render. You render locally,
  so you are the licensee — check your situation.
- **Kokoro-82M** (the narrator) is Apache-2.0; the ~90MB model downloads from Hugging Face on
  first `gitreel narrate`.
- Music and SFX are synthesized by scripts in this repo — no licensed assets anywhere.
- Requires **Node ≥ 20** and the **`gh` CLI** (authenticated) for PR fetching.
