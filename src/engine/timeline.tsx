import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { FPS, theme } from "./theme";

export type SceneSpec = {
  id: string;
  element: React.ReactNode;
  extraSeconds?: number;
  fixedSeconds?: number;
  sfx?: string;
  sfxVolume?: number;
};

export type NarrationManifest = {
  voice: string;
  scenes: Record<string, { seconds: number; text: string }>;
};

const NARRATION_START_PAD_SECONDS = 0.25;
const DEFAULT_TAIL_SECONDS = 0.5;

export function sceneDurationInFrames(spec: SceneSpec, manifest: NarrationManifest): number {
  if (spec.fixedSeconds !== undefined) {
    return Math.round(spec.fixedSeconds * FPS);
  }
  const narration = manifest.scenes[spec.id]?.seconds ?? 1.5;
  const total = NARRATION_START_PAD_SECONDS + narration + (spec.extraSeconds ?? DEFAULT_TAIL_SECONDS);
  return Math.round(total * FPS);
}

export function totalDurationInFrames(specs: readonly SceneSpec[], manifest: NarrationManifest): number {
  return specs.reduce((sum, spec) => sum + sceneDurationInFrames(spec, manifest), 0);
}

export const Timeline: React.FC<{
  episodeId: string;
  scenes: readonly SceneSpec[];
  manifest: NarrationManifest;
  music?: string;
  musicVolume?: number;
}> = ({ episodeId, scenes, manifest, music, musicVolume }) => {
  let cursor = 0;
  const sequences = scenes.map((spec) => {
    const duration = sceneDurationInFrames(spec, manifest);
    const from = cursor;
    cursor += duration;
    const hasNarration = manifest.scenes[spec.id] !== undefined && spec.fixedSeconds === undefined;
    return (
      <Sequence key={spec.id} from={from} durationInFrames={duration} name={spec.id}>
        {hasNarration && (
          <Sequence from={Math.round(NARRATION_START_PAD_SECONDS * FPS)} name={`${spec.id}-narration`}>
            <Audio src={staticFile(`audio/${episodeId}/${spec.id}.wav`)} />
          </Sequence>
        )}
        {spec.sfx && <Audio src={staticFile(`sfx/${spec.sfx}`)} volume={spec.sfxVolume ?? 0.4} />}
        {spec.element}
      </Sequence>
    );
  });
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      {music && <Audio loop src={staticFile(`music/${music}`)} volume={musicVolume ?? 0.13} />}
      {sequences}
    </AbsoluteFill>
  );
};
