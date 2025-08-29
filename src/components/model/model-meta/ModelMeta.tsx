"use client";

import type {ModelDetail} from "@/configs/models";
import "./ModelMeta.scss";

export default function ModelMeta({model}: { model: ModelDetail }) {
    const {about, stats, services, extras, agency, age, nationality, workingHours, rules} = model;

    return (
        <section className="model-meta" aria-label="Model details">
            <div className="model-meta__grid">
                <div className="model-meta__section">
                    <h3 className="model-meta__title">About</h3>
                    <div className="model-meta__text">
                        {agency && <p><b>Agency:</b> {agency}</p>}
                        {age && <p><b>Age:</b> {age}</p>}
                        {nationality && <p><b>Nationality:</b> {nationality}</p>}
                        {workingHours && <p><b>Hours:</b> {workingHours}</p>}
                        {about && <p>{about}</p>}
                    </div>
                    {rules && rules.length > 0 && (
                        <>
                            <h4 className="model-meta__subtitle">Rules</h4>
                            <ul className="model-meta__list">
                                {rules.map((r, i) => <li key={i} className="model-meta__list-item">{r}</li>)}
                            </ul>
                        </>
                    )}
                </div>

                {stats && (
                    <div className="model-meta__section">
                        <h3 className="model-meta__title">Stats</h3>
                        <ul className="model-meta__stats">
                            {stats.height && <li><span>Height</span><b>{stats.height}</b></li>}
                            {stats.bust && <li><span>Bust</span><b>{stats.bust}</b></li>}
                            {stats.waist && <li><span>Waist</span><b>{stats.waist}</b></li>}
                            {stats.hips && <li><span>Hips</span><b>{stats.hips}</b></li>}
                            {stats.eyes && <li><span>Eyes</span><b>{stats.eyes}</b></li>}
                            {stats.hair && <li><span>Hair</span><b>{stats.hair}</b></li>}
                            {stats.shoes && <li><span>Shoes</span><b>{stats.shoes}</b></li>}
                        </ul>
                    </div>
                )}

                {services && services.length > 0 && (
                    <div className="model-meta__section">
                        <h3 className="model-meta__title">Services</h3>
                        <ul className="model-meta__tags">
                            {services.map((s, i) => <li className="model-meta__tag" key={i}>{s}</li>)}
                        </ul>
                    </div>
                )}

                {extras && extras.length > 0 && (
                    <div className="model-meta__section">
                        <h3 className="model-meta__title">Extras</h3>
                        <ul className="model-meta__extras">
                            {extras.map((e, i) => (
                                <li key={i} className="model-meta__extra">
                                    <span className="model-meta__extra-name">{e.name}</span>
                                    <b className="model-meta__extra-price">{e.price}</b>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
