export { FPS, theme, severityColor, severityLabel, type Severity } from "./theme";
export {
  Timeline,
  sceneDurationInFrames,
  totalDurationInFrames,
  type SceneSpec,
  type NarrationManifest,
} from "./timeline";
export type { EpisodeDefinition } from "./episode-definition";
export { CodeBlock, CodeLine, type LineRange } from "./code/CodeBlock";
export { useTokenLines, type CodeLang, type TokenLine } from "./code/highlight";
export { SceneShell, Panel, FileChip, ContextTag } from "./scenes/SceneShell";
export { TitleCard, Pop } from "./scenes/TitleCard";
export { BigText } from "./scenes/BigText";
export { CodeScene, type SpotlightBeat, type TreeLine } from "./scenes/CodeScene";
export { CalloutOverlay, type Finding } from "./scenes/CalloutOverlay";
export { DiffMorph } from "./scenes/DiffMorph";
export {
  DiagramScene,
  type DiagramNode,
  type DiagramArrow,
  type ArrowSide,
} from "./scenes/DiagramScene";
export { FileTreeScene, type FileGroup, type FileEntry, type GroupSpotlight } from "./scenes/FileTreeScene";
export { MontageBeat, type MontageItem } from "./scenes/MontageBeat";
export { TerminalScene } from "./scenes/TerminalScene";
export { VerdictCard, type VerdictCount } from "./scenes/VerdictCard";
