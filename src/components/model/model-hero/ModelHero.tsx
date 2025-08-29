import Image from "next/image";
import "./ModelHero.scss";
import {ModelHeroProps} from "@/types/model-hero";

export default function ModelHero({ model, city }: ModelHeroProps) {
    const { name, photo, stats, about, slug } = model;

    return (
        <div className="model-hero">
            <div className="model-hero__left-container">
                <div className="model-hero__img">
                    <Image
                        src={photo}
                        alt={name}
                        fill
                        sizes="(max-width: 900px) 100vw, 60vw"
                        priority
                        style={{ objectFit: "cover" }}
                    />
                </div>
            </div>

            <div className="model-hero__right-container">
                <h1 className="model-hero__title">{name}</h1>

                {!!stats && (
                    <ul className="model-hero__stats">
                        {stats.height && <li><span>Height: </span><b>{stats.height}</b></li>}
                        {stats.bust   && <li><span>Bust: </span><b>{stats.bust}</b></li>}
                        {stats.waist  && <li><span>Waist: </span><b>{stats.waist}</b></li>}
                        {stats.hips   && <li><span>Hips: </span><b>{stats.hips}</b></li>}
                        {stats.eyes   && <li><span>Eyes: </span><b>{stats.eyes}</b></li>}
                        {stats.hair   && <li><span>Hair: </span><b>{stats.hair}</b></li>}
                        {stats.shoes  && <li><span>Shoes: </span><b>{stats.shoes}</b></li>}
                    </ul>
                )}

                {about && <p className="model-hero__about">{about}</p>}
            </div>
        </div>
    );
}
