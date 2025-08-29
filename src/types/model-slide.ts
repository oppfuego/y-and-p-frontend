import type {StaticImageData} from "next/image";

export type ModelSlideProps = {
    images: (StaticImageData | string)[];
    name: string;
    startIndex?: number;
};