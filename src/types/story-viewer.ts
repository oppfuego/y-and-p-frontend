import type {ModelDetail} from "@/configs/models";

export type Slide = { type: "image" | "video"; src: string };
export type StoryViewerProps = { models: ModelDetail[]; startModelIndex: number; onClose: () => void; city?: string };