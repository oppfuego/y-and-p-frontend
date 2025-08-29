"use client";

import Image from "next/image";
import Link from "next/link";
import {useEffect, useMemo, useRef, useState} from "react";
import {canonCity} from "@/utils/availability";
import "./StoryViewer.scss";
import {Slide, StoryViewerProps} from "@/types/story-viewer";

export default function StoryViewer({models, startModelIndex, onClose, city}: StoryViewerProps) {
    const prepared = useMemo(() => {
        return models.map(m => {
            const uniq: string[] = [];
            const push = (s?: any) => {
                if (!s) return;
                const src = typeof s === "string" ? s : s.src;
                if (src && !uniq.includes(src)) uniq.push(src);
            };
            push(m.videoUrl);
            push(m.photo);
            (m.gallery ?? []).forEach(push);
            const slides: Slide[] = uniq.map(src => ({type: src.endsWith(".mp4") ? "video" : "image", src}));
            return {model: m, slides};
        });
    }, [models]);

    const [mi, setMi] = useState(Math.min(Math.max(0, startModelIndex), prepared.length - 1));
    const [si, setSi] = useState(0);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<number | null>(null);

    const current = prepared[mi];
    const total = current.slides.length;
    const dur = current.slides[si]?.type === "video" ? 8000 : 4000;

    useEffect(() => {
        setProgress(0);
        if (timerRef.current) window.clearInterval(timerRef.current);
        const started = performance.now();
        timerRef.current = window.setInterval(() => {
            const t = performance.now() - started;
            setProgress(Math.min(100, (t / dur) * 100));
            if (t >= dur) {
                window.clearInterval(timerRef.current!);
                next();
            }
        }, 50);
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [mi, si, dur]);

    const next = () => {
        if (si + 1 < total) setSi(si + 1);
        else if (mi + 1 < prepared.length) {
            setMi(mi + 1);
            setSi(0);
        } else onClose();
    };

    const prev = () => {
        if (si > 0) setSi(si - 1);
        else if (mi > 0) {
            const prevSlides = prepared[mi - 1].slides.length;
            setMi(mi - 1);
            setSi(prevSlides - 1);
        }
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [mi, si]);

    const m = current.model;
    const slide = current.slides[si];

    return (
        <div className="story" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="story__wrap" onClick={(e) => e.stopPropagation()}>
                <div className="story__top">
                    <div className="story__bars">
                        {current.slides.map((_, i) => (
                            <span key={i} className="story__bar">
                <span className="story__bar-fill" style={{width: i < si ? "100%" : i === si ? `${progress}%` : "0%"}}/>
              </span>
                        ))}
                    </div>
                    <button className="story__close" type="button" aria-label="Close" onClick={onClose}>×</button>
                </div>

                <div className="story__media">
                    <div className="story__box">
                        {slide.type === "image" ? (
                            <Image
                                src={slide.src}
                                alt={m.name}
                                fill
                                sizes="(max-width: 768px) 90vw, 540px"
                                priority
                                style={{objectFit: "contain"}}
                            />
                        ) : (
                            <video className="story__video" src={slide.src} autoPlay muted playsInline/>
                        )}
                    </div>

                    <button className="story__tap story__tap--left" type="button" aria-label="Prev" onClick={prev}/>
                    <button className="story__tap story__tap--right" type="button" aria-label="Next" onClick={next}/>
                </div>

                <div className="story__info">
                    <div className="story__name">{m.name}</div>
                    <Link
                        className="story__link"
                        href={`/city/${canonCity(city ?? m.city)}/model/${m.slug}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Open profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
