"use client";

import type {Availability} from "@/configs/models";
import "./ModelAvailability.scss";

export default function ModelAvailability({availability}: { availability: Availability[] }) {
    return (
        <section className="model-availability" aria-label="Availability">
            <h2 className="model-availability__title">Availability</h2>
            <ul className="model-availability__list">
                {availability.map((a, i) => (
                    <li key={i} className="model-availability__item">
                        <div className="model-availability__row"><span>City</span><b>{a.city}</b></div>
                        <div className="model-availability__row"><span>Dates</span><b>{a.dateRangeText}</b></div>
                        <div className="model-availability__row"><span>Address</span><b>{a.address}</b></div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
