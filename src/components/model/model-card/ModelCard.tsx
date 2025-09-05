"use client";

import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import "./ModelCard.scss";

type Props = {
    src: string | StaticImageData;
    name: string;
    href: string;
    alt?: string;
    priority?: boolean;
};

export default function ModelCard({ src, alt = "", name, href, priority }: Props) {
    const isStatic = typeof src !== "string";

    return (
        <Link href={href} className="model-card" aria-label={`Open ${name}`} tabIndex={0}>
            <div className="model-card__media">
                <Image
                    src={src}
                    alt={alt || name}
                    fill
                    sizes="(max-width: 600px) 92vw,(max-width: 900px) 44vw,(max-width: 1400px) 30vw,22vw"
                    className="model-card__img"
                    priority={!!priority}
                    {...(isStatic ? { placeholder: "blur" as const } : { unoptimized: true })}
                />
            </div>

            <div className="model-card__overlay">
                <h3 className="model-card__title">{name}</h3>
            </div>
        </Link>
    );
}
