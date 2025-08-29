"use client";

import type {PriceEntry} from "@/configs/models";
import "./ModelPricing.scss";

export default function ModelPricing({pricing, name}: { pricing: PriceEntry[]; name: string }) {
    const incall = pricing.filter(p => p.type === "incall");
    const outcall = pricing.filter(p => p.type === "outcall");

    const Table = ({rows, title}: { rows: PriceEntry[]; title: string }) => (
        <div className="model-pricing__card">
            <h3 className="model-pricing__subtitle">{title}</h3>
            <table className="model-pricing__table" aria-label={`${title} prices for ${name}`}>
                <thead>
                <tr>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Shots</th>
                    <th>Notes</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r, i) => (
                    <tr key={i}>
                        <td>{r.duration}</td>
                        <td>{r.price}</td>
                        <td>{r.shots ?? "-"}</td>
                        <td>{r.notes ?? "-"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <section className="model-pricing" aria-label="Pricing">
            <h2 className="model-pricing__title">Pricing</h2>
            <div className="model-pricing__grid">
                {incall.length > 0 && <Table rows={incall} title="Incall"/>}
                {outcall.length > 0 && <Table rows={outcall} title="Outcall"/>}
            </div>
        </section>
    );
}
