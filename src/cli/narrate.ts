import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { episodeDir, manifestPath } from "./workspace.js";

type NarrationScript = {
  voice?: string;
  speed?: number;
  scenes: ReadonlyArray<{ id: string; text: string }>;
};

type Manifest = {
  voice: string;
  scenes: Record<string, { seconds: number; text: string }>;
};

export async function narrateEpisode(workspace: string, id: string, force: boolean): Promise<void> {
  const scriptFile = path.join(episodeDir(workspace, id), "narration.json");
  if (!existsSync(scriptFile)) {
    throw new Error(`no narration script at ${scriptFile} — run \`gitreel new ${id}\` first`);
  }
  const script = JSON.parse(readFileSync(scriptFile, "utf8")) as NarrationScript;
  const voice = script.voice ?? "am_michael";
  const speed = script.speed ?? 1.1;
  const outDir = path.join(workspace, "public", "audio", id);
  mkdirSync(outDir, { recursive: true });
  const manifestFile = manifestPath(workspace, id);
  const previous: Manifest | null = existsSync(manifestFile)
    ? (JSON.parse(readFileSync(manifestFile, "utf8")) as Manifest)
    : null;
  const manifest: Manifest = { voice, scenes: {} };

  console.log("loading Kokoro-82M (first run downloads the model, ~90MB)...");
  const { KokoroTTS } = await import("kokoro-js");
  const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
    dtype: "q8",
    device: "cpu",
  });

  for (const scene of script.scenes) {
    const wavPath = path.join(outDir, `${scene.id}.wav`);
    const cached = previous?.scenes[scene.id];
    if (!force && cached && cached.text === scene.text && previous?.voice === voice && existsSync(wavPath)) {
      manifest.scenes[scene.id] = cached;
      console.log(`  ${scene.id}: cached (${cached.seconds.toFixed(2)}s)`);
      continue;
    }
    const audio = await tts.generate(scene.text, { voice: voice as never, speed });
    await audio.save(wavPath);
    const seconds = audio.audio.length / audio.sampling_rate;
    manifest.scenes[scene.id] = { seconds, text: scene.text };
    console.log(`  ${scene.id}: ${seconds.toFixed(2)}s`);
  }

  writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  console.log(`wrote ${manifestFile}`);
}
