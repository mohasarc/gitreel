import type { SceneSpec } from "./timeline";

export type EpisodeDefinition = {
  readonly id: string;
  readonly title?: string;
  readonly music?: string;
  readonly musicVolume?: number;
  readonly scenes: readonly SceneSpec[];
};
