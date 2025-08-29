import type {StaticImageData} from "next/image";

export type LightboxProps = {
    images: (StaticImageData | string)[];
    name: string;
    initialIndex?: number;
    onClose: () => void;
};