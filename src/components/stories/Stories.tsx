"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { MODELS } from "@/configs/models";
import { isAvailableNow, canonCity } from "@/utils/availability";
import StoryViewer from "../story-viewer/StoryViewer";
import "./Stories.scss";

export default function Stories({ city }: { city?: string }) {
    const items = useMemo(
        () => MODELS.filter(m => isAvailableNow(m.availability, city) && (!city || canonCity(m.city) === canonCity(city))),
        [city]
    );
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    if (!items.length) return null;

    return (
        <>
            <section className="stories" aria-label="Stories of our models">
                <h2 className="stories__title">Stories of our models</h2>
                <div className="stories__container" role="list">
                    {items.map((m, idx) => (
                        <button
                            key={m.id}
                            type="button"
                            className="stories__item"
                            role="listitem"
                            aria-label={`${m.name} story`}
                            onClick={() => setOpenIndex(idx)}
                        >
              <span className="stories__ring">
                <span className="stories__thumb">
                  <Image
                      src={m.photo}
                      alt={m.name}
                      fill
                      sizes="(max-width: 768px) 80px, 100px"
                      style={{ objectFit: "cover" }}
                      priority
                  />
                </span>
              </span>
                            <span className="stories__name">{m.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            {openIndex !== null && (
                <StoryViewer
                    models={items}
                    startModelIndex={openIndex}
                    onClose={() => setOpenIndex(null)}
                    city={city}
                />
            )}
        </>
    );
}
