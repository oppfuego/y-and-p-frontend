"use client";

import Image from "next/image";
import Link from "next/link";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {canonCity} from "@/utils/availability";
import "./StoryViewer.scss";
import {Slide, StoryViewerProps} from "@/types/story-viewer";

export default function StoryViewer({models, startModelIndex, onClose, city}: StoryViewerProps) {
    const normalize = (raw?: string | { src: string }) => {
        if (!raw) return "/images/placeholder.jpg";
        const src = typeof raw === "string" ? raw : raw.src;
        if (!src) return "/images/placeholder.jpg";
        return !src.startsWith("http") && !src.startsWith("/") ? `/${src}` : src;
    };
    const isVideo = (s: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(s);

    const prepared = useMemo(() => {
        return models
            .map((m) => {
                const uniq: string[] = [];
                const push = (s?: string | { src: string }) => {
                    const src = normalize(s);
                    if (src && !uniq.includes(src)) uniq.push(src);
                };
                if (m.videoUrl) push(m.videoUrl);
                if (m.photo) push(m.photo);
                (m.gallery ?? []).forEach(push);
                const slides: Slide[] = uniq.map((src) => ({type: isVideo(src) ? "video" : "image", src}));
                return {model: m, slides};
            })
            .filter((x) => x.slides.length > 0);
    }, [models]);

    const [mi, setMi] = useState(0);
    const [si, setSi] = useState(0);

    useEffect(() => {
        const clampedMi = Math.min(Math.max(0, startModelIndex), Math.max(0, prepared.length - 1));
        setMi(clampedMi);
        setSi(0);
    }, [prepared.length, startModelIndex]);

    const [progress, setProgress] = useState(0);
    const timerRef = useRef<number | null>(null);

    const hasSlides = prepared.length > 0;
    const current = hasSlides ? prepared[mi] : null;
    const total = current?.slides.length ?? 0;
    const dur = current?.slides[si]?.type === "video" ? 8000 : 4000;

    const next = useCallback(() => {
        if (!hasSlides || total === 0) {
            onClose();
            return;
        }
        setSi((prevSi) => {
            if (prevSi + 1 < total) return prevSi + 1;
            setMi((prevMi) => {
                if (prevMi + 1 < prepared.length) return prevMi + 1;
                onClose();
                return prevMi;
            });
            return 0;
        });
    }, [hasSlides, total, prepared.length, onClose]);

    const prev = useCallback(() => {
        if (!hasSlides || total === 0) return;
        setSi((prevSi) => {
            if (prevSi > 0) return prevSi - 1;
            setMi((prevMi) => {
                if (prevMi > 0) {
                    const prevSlides = prepared[prevMi - 1].slides.length;
                    setSi(prevSlides - 1);
                    return prevMi - 1;
                }
                return prevMi;
            });
            return prevSi;
        });
    }, [hasSlides, total, prepared]);

    useEffect(() => {
        if (!hasSlides || total === 0) return;
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
    }, [mi, si, dur, next, hasSlides, total]);

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
    }, [next, prev, onClose]);

    if (!hasSlides || !current) return null;

    const m = current.model;
    const slide = current.slides[si];
    const cityForLink = canonCity(city ?? ((m as unknown as { city?: string }).city ?? ""));

    return (
        <div className="story" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="story__wrap" onClick={(e) => e.stopPropagation()}>
                <div className="story__top">
                    <div className="story__bars">
                        {current.slides.map((_, i) => (
                            <span key={i} className="story__bar">
                <span
                    className="story__bar-fill"
                    style={{width: i < si ? "100%" : i === si ? `${progress}%` : "0%"}}
                />
              </span>
                        ))}
                    </div>
                    <button className="story__close" type="button" aria-label="Close" onClick={onClose}>
                        ×
                    </button>
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
                                unoptimized
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
                        href={`/city/${cityForLink}/model/${m.slug}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Open profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
