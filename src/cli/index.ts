#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { Command } from "commander";
import { bundleEpisode, writeEntry } from "./bundling.js";
import { narrateEpisode } from "./narrate.js";
import { ensureWorkspace, episodeDir, packageRoot } from "./workspace.js";

const require = createRequire(import.meta.url);
const program = new Command();
const version = (JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8")) as { version: string })
  .version;

program.name("gitreel").description("Turn your pull requests into movie trailers.").version(version);

program
  .command("where")
  .description("print the gitreel workspace path")
  .action(() => {
    console.log(ensureWorkspace());
  });

program
  .command("new <id>")
  .description("scaffold a new episode (episode.tsx + narration.json)")
  .action((id: string) => {
    const workspace = ensureWorkspace();
    const target = episodeDir(workspace, id);
    if (existsSync(path.join(target, "episode.tsx"))) {
      console.error(`episode "${id}" already exists at ${target}`);
      process.exit(1);
    }
    mkdirSync(target, { recursive: true });
    cpSync(path.join(packageRoot, "templates", "episode"), target, { recursive: true });
    const episodeFile = path.join(target, "episode.tsx");
    const stamped = readFileSync(episodeFile, "utf8").replace(/EPISODE_ID/g, id);
    writeFileSync(episodeFile, stamped);
    console.log(`scaffolded ${target}`);
    console.log(`next: edit episode.tsx + narration.json, then \`gitreel narrate ${id}\``);
  });

program
  .command("narrate <id>")
  .description("generate narration audio + duration manifest (Kokoro TTS, local)")
  .option("--force", "regenerate all scenes, ignore cache", false)
  .action(async (id: string, options: { force: boolean }) => {
    const workspace = ensureWorkspace();
    await narrateEpisode(workspace, id, options.force);
  });

program
  .command("still <id>")
  .description("render a single frame as PNG (cheap visual verification)")
  .requiredOption("--frame <n>", "frame number")
  .option("--out <path>", "output path")
  .action(async (id: string, options: { frame: string; out?: string }) => {
    const workspace = ensureWorkspace();
    const { renderStill, selectComposition } = await import("@remotion/renderer");
    const serveUrl = await bundleEpisode(workspace, id);
    const composition = await selectComposition({ serveUrl, id, inputProps: {} });
    const frame = Number(options.frame);
    const output = options.out ?? path.join(workspace, "out", `${id}-f${frame}.png`);
    await renderStill({ composition, serveUrl, frame, output });
    console.log(output);
  });

program
  .command("render <id>")
  .description("render the episode to MP4")
  .option("--out <path>", "output path")
  .option("--draft", "fast low-quality render for iteration", false)
  .action(async (id: string, options: { out?: string; draft: boolean }) => {
    const workspace = ensureWorkspace();
    const { renderMedia, selectComposition } = await import("@remotion/renderer");
    const serveUrl = await bundleEpisode(workspace, id);
    const composition = await selectComposition({ serveUrl, id, inputProps: {} });
    const outputLocation = options.out ?? path.join(workspace, "out", `${id}.mp4`);
    let lastShown = -1;
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation,
      scale: options.draft ? 0.5 : 1,
      jpegQuality: options.draft ? 60 : 80,
      onProgress: ({ progress }) => {
        const percent = Math.floor(progress * 10) * 10;
        if (percent > lastShown) {
          lastShown = percent;
          console.log(`render ${percent}%`);
        }
      },
    });
    console.log(outputLocation);
  });

program
  .command("preview <id>")
  .description("open Remotion Studio for live-editing the episode")
  .action((id: string) => {
    const workspace = ensureWorkspace();
    const entryFile = writeEntry(workspace, id);
    const remotionBin = path.join(path.dirname(require.resolve("@remotion/cli/package.json")), "remotion-cli.js");
    const child = spawn(
      process.execPath,
      [remotionBin, "studio", entryFile, "--public-dir", path.join(workspace, "public")],
      { cwd: packageRoot, stdio: "inherit" },
    );
    child.on("exit", (code) => process.exit(code ?? 0));
  });

program
  .command("doctor")
  .description("check the environment: node, gh, browser, workspace")
  .action(async () => {
    const checks: Array<[string, () => string | Promise<string>]> = [
      ["node", () => {
        const major = Number(process.versions.node.split(".")[0]);
        if (major < 20) throw new Error(`node ${process.versions.node} — gitreel needs >= 20`);
        return process.versions.node;
      }],
      ["gh CLI", () => {
        execFileSync("gh", ["auth", "status"], { stdio: "pipe" });
        return "installed + authenticated";
      }],
      ["workspace", () => ensureWorkspace()],
      ["engine", () => {
        const engine = path.join(packageRoot, "dist", "engine", "index.js");
        if (!existsSync(engine)) throw new Error("engine build missing — reinstall gitreel");
        return engine;
      }],
      ["browser", async () => {
        const { ensureBrowser } = await import("@remotion/renderer");
        await ensureBrowser();
        return "headless shell ready";
      }],
    ];
    let failed = false;
    for (const [label, check] of checks) {
      try {
        const detail = await check();
        console.log(`  ok    ${label}: ${detail}`);
      } catch (error) {
        failed = true;
        console.log(`  FAIL  ${label}: ${(error as Error).message}`);
      }
    }
    process.exit(failed ? 1 : 0);
  });

program.parseAsync().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});
