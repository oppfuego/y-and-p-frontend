"use client";

import Image from "next/image";
import React, {useRef, useEffect, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, Pagination, EffectCoverflow, Keyboard, A11y} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import Lightbox from "@/components/lightbox/Lightbox";
import {MdOutlineKeyboardArrowLeft} from "react-icons/md";
import {MdOutlineKeyboardArrowRight} from "react-icons/md";
import "./ModelSlider.scss";
import {ModelSlideProps} from "@/types/model-slide";

export default function ModelSlider({images, name, startIndex = 0}: ModelSlideProps) {
    const prevRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);
    const swiperRef = useRef<any>(null);

    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    useEffect(() => {
        if (swiperRef.current && prevRef.current && nextRef.current && swiperRef.current.navigation) {
            swiperRef.current.params.navigation.prevEl = prevRef.current;
            swiperRef.current.params.navigation.nextEl = nextRef.current;
            swiperRef.current.navigation.destroy();
            swiperRef.current.navigation.init();
            swiperRef.current.navigation.update();
        }
    }, []);

    if (!images?.length) return null;

    return (
        <section className="model-slider" aria-label={`${name} gallery`}>
            <h2 className="model-slider__title">Gallery</h2>

            <div className="model-slider__wrap">
                <Swiper
                    className="model-slider__swiper"
                    modules={[Navigation, Pagination, EffectCoverflow, Keyboard, A11y]}
                    initialSlide={Math.min(startIndex, images.length - 1)}
                    effect="coverflow"
                    coverflowEffect={{rotate: 0, stretch: 0, depth: 150, modifier: 2.5, slideShadows: true}}
                    centeredSlides
                    slidesPerView="auto"
                    spaceBetween={15}
                    keyboard={{enabled: true}}
                    pagination={{el: ".model-slider__dots", clickable: true}}
                    onBeforeInit={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                >
                    {images.map((img, i) => (
                        <SwiperSlide className="model-slider__slide" key={i}>
                            <button
                                className="model-slider__media"
                                onClick={() => setLightboxIndex(i)}
                                aria-label={`Open ${name} photo ${i + 1}`}
                            >
                                <Image
                                    src={img}
                                    alt={`${name} photo ${i + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 900px"
                                    priority={i === 0}
                                    style={{objectFit: "cover"}}
                                />
                            </button>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="model-slider__nav">
                    <button ref={prevRef} className="model-slider__btn model-slider__btn--prev"
                            aria-label="Previous slide">
                        <MdOutlineKeyboardArrowLeft/>
                    </button>
                    <ul className="model-slider__dots"/>
                    <button ref={nextRef} className="model-slider__btn model-slider__btn--next" aria-label="Next slide">
                        <MdOutlineKeyboardArrowRight/>
                    </button>
                </div>
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    images={images}
                    name={name}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </section>
    );
}
