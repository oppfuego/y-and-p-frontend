import type { StaticImageData } from "next/image";
import AnastasiaCover from "../../public/images/anastasia/anastasia-cover.jpg";
import Anastasia2 from "../../public/images/anastasia/anastasia-2.jpg";
import Anastasia3 from "../../public/images/anastasia/anastasia-3.jpg";
import Anastasia4 from "../../public/images/anastasia/anastasia-4.jpg";
import Anastasia5 from "../../public/images/anastasia/anastasia-5.jpg";
import Anastasia6 from "../../public/images/anastasia/anastasia-6.jpg";

import DanielaCover from "../../public/images/daniela/daniela-cover.jpg";
import Daniela2 from "../../public/images/daniela/daniela-2.jpg";
import Daniela3 from "../../public/images/daniela/daniela-3.jpg";
import Daniela4 from "../../public/images/daniela/daniela-4.jpg";
import Daniela5 from "../../public/images/daniela/daniela-5.jpg";
import Daniela6 from "../../public/images/daniela/daniela-6.jpg";
import Daniela7 from "../../public/images/daniela/daniela-7.jpg";

export type ModelStats = {
    height?: string;
    bust?: string;
    waist?: string;
    hips?: string;
    eyes?: string;
    hair?: string;
    shoes?: string;
};

export type PriceEntry = {
    type: "incall" | "outcall";
    duration: string;
    price: string;
    shots?: number;
    notes?: string;
};

export type Availability = {
    city: string;
    dateRangeText: string;
    address: string;
};

export type Extra = { name: string; price: string };

export type ModelDetail = {
    id: string;
    slug: string;
    city: string;
    name: string;
    photo: StaticImageData | string;
    about?: string;
    gallery?: (StaticImageData | string)[];
    videoUrl?: string;
    stats?: ModelStats;
    agency?: string;
    age?: number;
    nationality?: string;
    services?: string[];
    extras?: Extra[];
    pricing?: PriceEntry[];
    availability?: Availability[];
    workingHours?: string;
    rules?: string[];
};

export const MODELS: ModelDetail[] = [
    {
        id: "1",
        slug: "anastasia-a1",
        city: "milan",
        name: "Anastasia",
        photo: AnastasiaCover,
        about: "Young, elegant, passionate. International model. Based in Milan.",
        gallery: [Anastasia2, Anastasia3, Anastasia4, Anastasia5, Anastasia6, ],
        stats: { height: "176 cm", bust: "84", waist: "60", hips: "90", eyes: "Blue", hair: "Blond" },
        agency: "Y&P Agency",
        age: 22,
        nationality: "Ukraine",
        pricing: [
            { type: "incall", duration: "30m", price: "150€", shots: 1 },
            { type: "incall", duration: "1h", price: "200€", shots: 2 },
            { type: "incall", duration: "2h", price: "400€" },
            { type: "outcall", duration: "1h", price: "350€ + taxi" },
            { type: "outcall", duration: "2h", price: "500€ + taxi" },
        ],
        availability: [
            { city: "Milano", dateRangeText: "01/09–30/12", address: "Via Gaudenzio Ferrari, 9/A" },
            { city: "Roma", dateRangeText: "01/09–30/12", address: "Via Giacomo Giri, 7" },
        ],
        services: [
            "French kiss",
            "Sex in different positions",
            "Foot fetish",
            "BJ without condom",
            "Masturbation",
            "Sexy outfit",
        ],
        extras: [
            { name: "Cum in mouth", price: "50€" },
            { name: "Deepthroat", price: "50€" },
            { name: "Swallow", price: "100€" },
        ],
        workingHours: "09:00–00:00",
        rules: ["No Duo", "No discounts", "No 100 for 15/20 min"],
        videoUrl: "/videos/anastasia-1.mp4",
    },
    {
        id: "2",
        slug: "daniela-d1",
        city: "rome",
        name: "Anastasia",
        photo: DanielaCover,
        about: "Young, elegant, passionate. International model. Based in Milan.",
        gallery: [Daniela2, Daniela3, Daniela4, Daniela5, Daniela6, Daniela7],
        stats: { height: "176 cm", bust: "84", waist: "60", hips: "90", eyes: "Blue", hair: "Blond" },
        agency: "Y&P Agency",
        age: 22,
        nationality: "Ukraine",
        pricing: [
            { type: "incall", duration: "30m", price: "150€", shots: 1 },
            { type: "incall", duration: "1h", price: "200€", shots: 2 },
            { type: "incall", duration: "2h", price: "400€" },
            { type: "outcall", duration: "1h", price: "350€ + taxi" },
            { type: "outcall", duration: "2h", price: "500€ + taxi" },
        ],
        availability: [
            { city: "Milano", dateRangeText: "01/09–30/12", address: "Via Gaudenzio Ferrari, 9/A" },
            { city: "Roma", dateRangeText: "01/09–30/12", address: "Via Giacomo Giri, 7" },
        ],
        services: [
            "French kiss",
            "Sex in different positions",
            "Foot fetish",
            "BJ without condom",
            "Masturbation",
            "Sexy outfit",
        ],
        extras: [
            { name: "Cum in mouth", price: "50€" },
            { name: "Deepthroat", price: "50€" },
            { name: "Swallow", price: "100€" },
        ],
        workingHours: "09:00–00:00",
        rules: ["No Duo", "No discounts", "No 100 for 15/20 min"],
        videoUrl: "/videos/anastasia-1.mp4",
    },
];

export const getModelBySlug = (slug: string) => MODELS.find(m => m.slug === slug);
