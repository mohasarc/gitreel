import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const packageRoot = fileURLToPath(new URL("../..", import.meta.url));

export function configFilePath(): string {
  return path.join(homedir(), ".config", "gitreel", "config.json");
}

export function resolveWorkspace(): string {
  const fromEnv = process.env.GITREEL_HOME;
  if (fromEnv) return path.resolve(fromEnv);
  const configFile = configFilePath();
  if (existsSync(configFile)) {
    const config = JSON.parse(readFileSync(configFile, "utf8")) as { workspace?: string };
    if (config.workspace) return config.workspace;
  }
  return path.join(homedir(), "gitreel");
}

export function ensureWorkspace(): string {
  const workspace = resolveWorkspace();
  for (const dir of ["episodes", "out", ".cache", "public/audio", "public/music", "public/sfx"]) {
    mkdirSync(path.join(workspace, dir), { recursive: true });
  }
  seedAssets(workspace);
  const configFile = configFilePath();
  if (!existsSync(configFile)) {
    mkdirSync(path.dirname(configFile), { recursive: true });
    writeFileSync(configFile, JSON.stringify({ workspace }, null, 2));
  }
  return workspace;
}

function seedAssets(workspace: string): void {
  const assetsDir = path.join(packageRoot, "assets");
  for (const kind of ["music", "sfx"]) {
    const target = path.join(workspace, "public", kind);
    const source = path.join(assetsDir, kind);
    if (!existsSync(source)) continue;
    cpSync(source, target, { recursive: true, force: false, errorOnExist: false });
  }
}

export function episodeDir(workspace: string, id: string): string {
  return path.join(workspace, "episodes", id);
}

export function manifestPath(workspace: string, id: string): string {
  return path.join(workspace, "public", "audio", id, "manifest.json");
}

export function requireEpisode(workspace: string, id: string): string {
  const file = path.join(episodeDir(workspace, id), "episode.tsx");
  if (!existsSync(file)) {
    throw new Error(`episode "${id}" not found at ${file} — run \`gitreel new ${id}\` first`);
  }
  return file;
}
