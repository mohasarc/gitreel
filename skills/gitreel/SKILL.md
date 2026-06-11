---
name: gitreel
description: Turn a GitHub pull request into a narrated, fast-paced movie-trailer-style review video. Use when the user asks for a PR video, a video walkthrough/review of a PR, or invokes /gitreel. Args: PR number or URL (required), mode `short` (default, ~3-5 min) or `long` (~6-10 min), optional path to a review .md whose findings get woven into the video, optional --draft for a fast low-res preview.
---

# gitreel

You produce a narrated video that reviews a GitHub PR — fast-paced, funny, visually clean
(Fireship-style). The `gitreel` CLI is your instrument: it owns the render engine, TTS, and
workspace. You are the writer-director: you read the PR, write the screenplay (narration +
scene composition), and drive the CLI.

## Step 0 — ensure the engine

Run `gitreel --version`. If missing, install it: `npm i -g gitreel`, then run `gitreel doctor`
and resolve anything it flags (it checks node ≥ 20, the `gh` CLI auth, the render browser).
`gitreel where` prints the workspace (default `~/gitreel`, override via `GITREEL_HOME`).

## Pipeline

1. **Gather**: `gh pr view <n> --json title,body,commits,files` and `gh pr diff <n>` (add
   `--repo owner/name` for PRs outside the cwd). Read the PR body and the commit sequence —
   the video narrates the change in logical order (commit order is usually right).
2. **Scaffold**: `gitreel new <episode-id>` (use `<repo>-<number>`, e.g. `fastify-5821`). This
   creates `episodes/<id>/episode.tsx` + `narration.json` in the workspace.
3. **Write the screenplay** (narration.json + episode.tsx). Structure is non-negotiable,
   high level FIRST:
   - (a) **title card**; (b) **goal scene** — what the PR is for, in plain words, before any code;
     (c) **architecture diagram** (`DiagramScene`) — pre-existing parts dimmed, narration says
     "none of this is new"; (d) **files overview** (`FileTreeScene`) — every changed file grouped
     by area, narration walks the groups via spotlights; (e) **problem statement** — why this
     change is needed/hard; (f) **roadmap** (`MontageBeat` with per-item `atSecond`) — the numbered
     steps the detail half will follow; (g) **detail scenes**, kickers numbered
     "step N of M · <area>"; (h) **review beats**; (i) **verdict card**.
   - Short mode = 3–5 load-bearing changes close-up; long mode = every commit gets a beat.
4. **Narrate**: `gitreel narrate <id>`. Caches per-scene by text; `--force` regenerates all.
5. **Time the beats**: read `<workspace>/public/audio/<id>/manifest.json` for each scene's
   measured seconds, then set every `atSecond` (spotlights, diagram reveals, morphs) at
   word-fraction × measured duration. Never guess timings from word counts alone.
6. **Verify with stills BEFORE the full render**: `gitreel still <id> --frame <n>` at each scene's
   midpoint (compute frame offsets: scenes run sequentially, each 0.25s lead + narration seconds
   + 0.5s tail, at 30fps). Look for: clipped titles (drop the scene title or shrink fontSize),
   overflowing panels, spotlights on wrong lines, arrows not landing on their boxes.
7. **Render**: `gitreel render <id>` (`--draft` for fast low-res iteration), then open the
   printed MP4 path for the user.

## Episode contract

`episode.tsx` default-exports an `EpisodeDefinition` from `gitreel/engine`:
`{ id, music: "drive.wav", musicVolume: 0.11, scenes: SceneSpec[] }`. Each `SceneSpec` is
`{ id, element, sfx?, sfxVolume?, extraSeconds?, fixedSeconds? }` — scene ids must match
narration.json scene ids; narration audio duration drives scene duration.

Scene primitives (all from `gitreel/engine`): `TitleCard`, `BigText`, `CodeScene` (timed
`spotlights`, optional `tree` breadcrumb + `finding` callout), `DiffMorph` (before→after morph at
`morphAtSecond`), `DiagramScene` (nodes/arrows with timed reveals — ALWAYS set explicit
`fromSide`/`toSide` on arrows), `FileTreeScene` (grouped files, per-group spotlights),
`TerminalScene` (typed command + revealed output), `MontageBeat`, `VerdictCard`, `CalloutOverlay`,
plus `SceneShell`/`Panel`/`FileChip` for bespoke scenes. SFX in the workspace: `whoosh.wav`,
`pop.wav`, `sting.wav`, `thud.wav`, `tick.wav`, `success.wav`.

## Craft rules (each one earned from viewer feedback — do not skip)

- **Length is not a constraint.** Viewers can 2x. Cutting context to save seconds is the cardinal
  sin; never let a video feel like it assumes knowledge it didn't establish.
- **Every detail scene grounds itself in its first sentence** — whose code this is, who calls it,
  or what came before ("this is the class the CLI calls", "remember the Router from earlier?").
  A scene that opens cold on new code is a bug.
- **Introduce every example before its payoff.** Any class/fixture appearing in a terminal-output
  scene needs its own intro scene (code + tree breadcrumb) first.
- **Never show a file the viewer can't place** — unfamiliar paths get the `tree` breadcrumb.
- **Introduce fixture/demo code as fake**: narration says it's a fake project that exists for
  tests; badge it "fake demo code" (amber). Never present it as the PR's production code.
- **Existing vs new, everywhere**: pre-existing code/architecture renders dimmed + tagged; new
  code full-brightness. Never present old code as new.
- **Narration style**: punchy, dry-to-roasty humor, short sentences, no filler. Spell for speech
  ("T-S morph", "PR fifty eight twenty one"). ~150 spoken words ≈ 1 minute. Voice `am_michael`,
  speed 1.1.
- **Review findings**: if the user supplied a review .md, extract findings and weave each into the
  scene showing that code via the `finding` prop (severity: blocking=red / warn=amber / nit=grey).
  No review file → do your own light pass over the diff. Always end with `VerdictCard`
  (counts + stamp).
- Code snippets: abridge to what the narration discusses (≤ ~20 lines per scene), real code from
  the diff, never pseudo-code presented as real.
- New scene-type ideas are welcome — build bespoke scenes from `SceneShell`/`Panel` primitives in
  the episode file; they don't need to live in the engine.

## Gotchas (each one cost a render — respect them)

- The bundler does NOT type-check episode.tsx; type errors surface only as runtime crashes during
  still/render. Render one cheap still immediately after writing the episode to catch them early.
- `spotlights[].lines` ranges are TUPLES: `[[4, 9]]`, never `{ from: 4, to: 9 }`.
- Diagram arrow labels draw UNDER node boxes — keep them short and away from nodes.
- All `atSecond` timings are scene-local; narration starts after a 0.25s lead pad, so add 0.25 to
  every word-fraction timing.
- `DiagramScene` nodes: `kind: "new"` shows a NEW badge automatically; `kind: "focus"` is for
  spotlighting pre-existing code and shows a badge only if you set `badge: "..."` — never present
  existing code as new.
- `React` must be imported in episode.tsx.
