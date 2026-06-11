import React from "react";
import {
  BigText,
  CodeScene,
  DiagramScene,
  DiffMorph,
  FileTreeScene,
  MontageBeat,
  TerminalScene,
  TitleCard,
  VerdictCard,
  theme,
  type EpisodeDefinition,
  type SceneSpec,
} from "gitreel/engine";

const exploitCode = `const schema = z.looseObject({ name: z.string() });

const input = JSON.parse(
  '{"__proto__":{"isAdmin":true},"name":"alice"}'
);

const parsed = schema.parse(input);

parsed.isAdmin;
// true — inherited, attacker-controlled`;

const fixBefore = `const unrecognized: string[] = [];
// iterate over input keys
const keySet = def.keySet;
const _catchall = def.catchall!._zod;
const t = _catchall.def.type;
for (const key in input) {
  if (keySet.has(key)) continue;
  if (t === "never") {
    unrecognized.push(key);
    continue;
  }`;

const fixAfter = `const unrecognized: string[] = [];
const keySet = def.keySet;
const _catchall = def.catchall!._zod;
const t = _catchall.def.type;
for (const key in input) {
  // skip __proto__ so it can't replace the result prototype
  // via the assignment setter on the plain {} we build into
  if (key === "__proto__") continue;
  if (keySet.has(key)) continue;
  if (t === "never") {
    unrecognized.push(key);
    continue;
  }`;

const testsCode = `describe("__proto__ in object catchall paths", () => {
  const protoInput = () =>
    JSON.parse('{"__proto__":{"isAdmin":true},"name":"alice"}');

  test("looseObject drops __proto__ and preserves Object.prototype", () => {
    const parsed = z.looseObject({ name: z.string() }).parse(protoInput());
    expect(Object.keys(parsed)).toEqual(["name"]);
    expect((parsed as any).isAdmin).toBeUndefined();
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype);
  });

  test("passthrough drops __proto__", () => { /* same drill */ });
  test("catchall(unknown) drops __proto__", () => { /* same drill */ });
  test("safeParseAsync + jitless drops __proto__", async () => { /* ... */ });
  test("strict does not surface __proto__ as unrecognized", () => { /* ... */ });
});`;

const strictTestCode = `test("strict does not surface __proto__ as unrecognized", () => {
  const schema = z.object({ name: z.string() }).strict();
  const result = schema.safeParse(protoInput());
  expect(result.success).toBe(true);
});`;

const payoffOutput = `parsed.isAdmin                 → undefined
Object.keys(parsed)            → [ 'name' ]
Object.getPrototypeOf(parsed)  → Object.prototype

poisoned key: evaporated`;

const scenes: SceneSpec[] = [
  {
    id: "cold-open",
    sfx: "whoosh.wav",
    element: (
      <TitleCard
        chip="colinhacks/zod · PR #5898"
        words={["zod", "vs", "__proto__"]}
        subtitle="1 commit · 2 files · security fix"
      />
    ),
  },
  {
    id: "goal",
    sfx: "pop.wav",
    element: (
      <BigText
        emoji="🛡️"
        text="__proto__ must not hijack your parsed objects"
        sub="that's it — that's the PR"
      />
    ),
  },
  {
    id: "context",
    sfx: "whoosh.wav",
    element: (
      <DiagramScene
        kicker="context · none of this is new"
        title="how zod parses an object"
        legend
        nodes={[
          {
            id: "input",
            label: "input",
            sub: "hostile JSON",
            icon: "☣️",
            x: 300,
            y: 210,
            w: 440,
            kind: "existing",
            atSecond: 4.5,
          },
          {
            id: "schema",
            label: "schema",
            sub: "validates known keys",
            icon: "🧬",
            x: 880,
            y: 210,
            w: 440,
            kind: "existing",
            atSecond: 6.9,
          },
          {
            id: "catchall",
            label: "handleCatchall",
            sub: "extra keys land here",
            icon: "🕳️",
            x: 1440,
            y: 210,
            w: 470,
            kind: "focus",
            badge: "CRIME SCENE",
            atSecond: 11.0,
          },
          {
            id: "result",
            label: "parsed result",
            sub: "a fresh {}",
            icon: "📦",
            x: 880,
            y: 580,
            w: 440,
            kind: "existing",
            atSecond: 14.5,
          },
        ]}
        arrows={[
          {
            from: "input",
            to: "schema",
            fromSide: "right",
            toSide: "left",
            kind: "existing",
            atSecond: 7.4,
          },
          {
            from: "schema",
            to: "catchall",
            fromSide: "right",
            toSide: "left",
            kind: "existing",
            label: "extras",
            atSecond: 11.5,
          },
          {
            from: "catchall",
            to: "result",
            fromSide: "bottom",
            toSide: "right",
            kind: "existing",
            label: "copies extras",
            atSecond: 15.0,
          },
        ]}
      />
    ),
  },
  {
    id: "files-overview",
    sfx: "pop.wav",
    element: (
      <FileTreeScene
        kicker="the diff"
        title="the whole PR, one screen"
        columns={2}
        groups={[
          {
            label: "packages/zod/src/v4/core",
            icon: "🔧",
            files: [{ name: "schemas.ts", status: "modified", note: "the fix — 3 lines" }],
          },
          {
            label: "packages/zod/src/v4/classic/tests",
            icon: "🧪",
            files: [{ name: "object.test.ts", status: "modified", note: "+46 lines" }],
          },
        ]}
        spotlights={[
          { atSecond: 0, groupIndex: null },
          { atSecond: 3.3, groupIndex: 0 },
          { atSecond: 7.6, groupIndex: 1 },
        ]}
      />
    ),
  },
  {
    id: "problem",
    sfx: "sting.wav",
    element: (
      <CodeScene
        kicker="the problem"
        title="the exploit"
        file="exploit.ts"
        badge="proof of concept"
        badgeColor={theme.amber}
        code={exploitCode}
        lang="typescript"
        fontSize={28}
        spotlights={[
          { atSecond: 2.0, lines: [[3, 5]], label: "JSON.parse happily emits a __proto__ key" },
          { atSecond: 5.9, lines: [[7, 7]], label: "name validates fine — extras hit handleCatchall" },
          { atSecond: 19.0, lines: [[9, 10]], label: "inherited, attacker-controlled, zod-validated" },
        ]}
      />
    ),
  },
  {
    id: "roadmap",
    sfx: "whoosh.wav",
    element: (
      <MontageBeat
        kicker="the route"
        title="three stops"
        items={[
          { icon: "🔧", label: "1 · the fix", sub: "core/schemas.ts", atSecond: 1.9 },
          { icon: "🧪", label: "2 · the proof", sub: "object.test.ts", atSecond: 3.6 },
          { icon: "🎉", label: "3 · the payoff", sub: "exploit, neutralized", atSecond: 5.6 },
        ]}
      />
    ),
  },
  {
    id: "fix",
    sfx: "pop.wav",
    element: (
      <DiffMorph
        kicker="step 1 of 3 · the fix"
        title="handleCatchall learns one guard"
        file="packages/zod/src/v4/core/schemas.ts"
        before={fixBefore}
        after={fixAfter}
        lang="typescript"
        fontSize={27}
        morphAtSecond={4.4}
      />
    ),
  },
  {
    id: "tests",
    sfx: "pop.wav",
    element: (
      <CodeScene
        kicker="step 2 of 3 · the proof"
        title="poison every catchall path"
        file="packages/zod/src/v4/classic/tests/object.test.ts"
        badge="new tests"
        badgeColor={theme.green}
        code={testsCode}
        lang="typescript"
        fontSize={23}
        spotlights={[
          { atSecond: 4.1, lines: [[2, 3]], label: "the poisoned input" },
          { atSecond: 7.5, lines: [[5, 10]], label: "looseObject" },
          { atSecond: 8.35, lines: [[13, 13]], label: "passthrough" },
          { atSecond: 8.8, lines: [[14, 14]], label: "catchall(unknown)" },
          { atSecond: 9.2, lines: [[15, 15]], label: "async + jitless" },
          { atSecond: 10.5, lines: [[16, 16]], label: "strict" },
          { atSecond: 11.3, lines: [[7, 9]], label: "isAdmin gone, prototype intact" },
        ]}
      />
    ),
  },
  {
    id: "payoff",
    sfx: "success.wav",
    element: (
      <TerminalScene
        kicker="step 3 of 3 · the payoff"
        title="same exploit, patched zod"
        command="node exploit.mjs"
        output={payoffOutput}
        fontSize={30}
        outputAtSecond={4.6}
        highlightPattern={/undefined|Object\.prototype/}
      />
    ),
  },
  {
    id: "review-1",
    sfx: "sting.wav",
    element: (
      <CodeScene
        kicker="review"
        title="one thing worth a look"
        file="packages/zod/src/v4/classic/tests/object.test.ts"
        badge="new test"
        badgeColor={theme.green}
        code={strictTestCode}
        lang="typescript"
        fontSize={28}
        spotlights={[
          { atSecond: 3.5, lines: [[2, 2]], label: "strict mode: unknown keys are errors" },
          { atSecond: 10.0, lines: [[4, 4]], label: "…but __proto__ passes, silently" },
        ]}
        finding={{
          severity: "warn",
          title: "strict() now silently swallows __proto__",
          detail: "the hostile key is dropped, not reported as unrecognized — deliberate, but worth a conscious nod",
          atSecond: 6.8,
        }}
      />
    ),
  },
  {
    id: "verdict",
    sfx: "whoosh.wav",
    extraSeconds: 1.6,
    element: (
      <VerdictCard
        counts={[
          { severity: "blocking", count: 0, label: "blocking" },
          { severity: "warn", count: 1, label: "worth a look" },
          { severity: "nit", count: 0, label: "nits" },
        ]}
        stamp="SHIP IT"
        stampAtSecond={9.0}
      />
    ),
  },
];

const episode: EpisodeDefinition = {
  id: "zod-5898",
  music: "drive.wav",
  musicVolume: 0.11,
  scenes,
};

export default episode;
