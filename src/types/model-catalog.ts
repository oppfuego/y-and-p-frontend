import type {StaticImageData} from "next/image";

export type ModelCardProps = {
    src: string | StaticImageData;
    alt?: string;
    name: string;
    href: string;
    priority?: boolean;
};