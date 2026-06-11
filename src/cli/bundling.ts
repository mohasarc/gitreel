import { existsSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { manifestPath, packageRoot, requireEpisode } from "./workspace.js";

const require = createRequire(import.meta.url);

export function writeEntry(workspace: string, id: string): string {
  const episodeFile = requireEpisode(workspace, id);
  const manifest = manifestPath(workspace, id);
  if (!existsSync(manifest)) {
    throw new Error(`no narration manifest for "${id}" — run \`gitreel narrate ${id}\` first`);
  }
  const entry = `import React from "react";
import { Composition, registerRoot } from "remotion";
import { FPS, Timeline, totalDurationInFrames } from "gitreel/engine";
import episode from ${JSON.stringify(episodeFile)};
import manifest from ${JSON.stringify(manifest)};

const Root = () => (
  <Composition
    id={episode.id}
    component={() => (
      <Timeline
        episodeId={episode.id}
        scenes={episode.scenes}
        manifest={manifest}
        music={episode.music}
        musicVolume={episode.musicVolume}
      />
    )}
    durationInFrames={totalDurationInFrames(episode.scenes, manifest)}
    fps={FPS}
    width={1920}
    height={1080}
  />
);

registerRoot(Root);
`;
  const entryFile = path.join(workspace, ".cache", `entry-${id}.tsx`);
  writeFileSync(entryFile, entry);
  return entryFile;
}

const packageDir = (name: string): string => path.dirname(require.resolve(`${name}/package.json`));

export function gitreelWebpackOverride(config: Record<string, unknown>): Record<string, unknown> {
  const resolve = (config.resolve ?? {}) as Record<string, unknown>;
  const module = (config.module ?? {}) as Record<string, unknown>;
  const rules = (module.rules ?? []) as unknown[];
  return {
    ...config,
    resolve: {
      ...resolve,
      alias: {
        ...((resolve.alias as Record<string, string>) ?? {}),
        "gitreel/engine": path.join(packageRoot, "dist", "engine", "index.js"),
        react: packageDir("react"),
        "react-dom": packageDir("react-dom"),
        remotion: packageDir("remotion"),
      },
      modules: [path.join(packageRoot, "node_modules"), "node_modules"],
    },
    module: {
      ...module,
      rules: [...rules, { test: /\.js$/, resolve: { fullySpecified: false } }],
    },
  };
}

export async function bundleEpisode(workspace: string, id: string): Promise<string> {
  const entryFile = writeEntry(workspace, id);
  return bundle({
    entryPoint: entryFile,
    publicDir: path.join(workspace, "public"),
    outDir: path.join(workspace, ".cache", `bundle-${id}`),
    webpackOverride: gitreelWebpackOverride as never,
  });
}
