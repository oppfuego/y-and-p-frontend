"use client";

import Link from "next/link";
import Image from "next/image";
import "./ModelCard.scss";
import { ModelCardProps } from "@/types/model-catalog";

export default function ModelCard({ src, alt = "", name, href, priority }: ModelCardProps) {
    return (
        <Link href={href} className="model-card" aria-label={`Open ${name}`} tabIndex={0}>
            <div className="model-card__media">
                <Image
                    src={src}
                    alt={alt || name}
                    fill
                    sizes="(max-width: 600px) 92vw,(max-width: 900px) 44vw,(max-width: 1400px) 30vw,22vw"
                    className="model-card__img"
                    placeholder="blur"
                    priority={!!priority}
                />
            </div>

            <div className="model-card__overlay">
                <h3 className="model-card__title">{name}</h3>
            </div>
        </Link>
    );
}
