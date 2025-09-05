"use client";

import React, { useEffect, useState } from "react";
import "./ModelList.scss";
import Image from "next/image";
import { Button, Stack, Alert } from "@mui/material";
import ModelUpsertModal, { ModelValues } from "@/components/model-upsert-modal/ModelUpsertModal";

type Availability = { city: string; startDate: string; endDate: string };
type ModelCard = ModelValues & { _id: string; slug: string; availability: Availability[] };

const ModelList = () => {
    const [models, setModels] = useState<ModelCard[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [editCtx, setEditCtx] = useState<{ open: boolean; slug?: string; title?: string }>({ open: false });

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/models/all-models", { cache: "no-store" });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setModels(data);
                    setError(null);
                } else {
                    setError(data?.message || "Failed to load models");
                    setModels([]);
                }
            } catch {
                setError("Network error while loading models");
                setModels([]);
            }
        })();
    }, []);

    const isAvailable = (availability: Availability[]) => {
        const now = new Date();
        return availability?.some((a) => {
            const start = new Date(a.startDate);
            const end = new Date(a.endDate);
            return start <= now && now <= end;
        });
    };

    const normalizePhotoSrc = (raw?: string): string => {
        if (!raw) return "/images/placeholder.jpg";
        if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
        if (raw.startsWith("/")) return raw;
        return `/${raw}`;
    };

    const submitCreate = async (payload: ModelValues) => {
        const res = await fetch("/api/models", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to create");
        return data;
    };

    const submitEdit = async (payload: Partial<ModelValues>) => {
        const slug = editCtx.slug!;
        const res = await fetch(`/api/models/${slug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to update");
        return data;
    };

    return (
        <div className="model-list">
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <h1 className="model-list__title">Models List (Admin)</h1>
                <Button variant="contained" onClick={() => setCreateOpen(true)}>
                    Add new model
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <div className="model-list__container">
                {models.map((model, idx) => {
                    const available = isAvailable(model.availability || []);
                    const city = model.availability?.[0]?.city || "—";
                    const period = model.availability?.[0]
                        ? `${model.availability[0].startDate} → ${model.availability[0].endDate}`
                        : "—";

                    return (
                        <div key={model._id} className={`model-list__card ${available ? "available" : "unavailable"}`}>
                            <div className="model-list__photo-wrap">
                                <Image
                                    src={normalizePhotoSrc(model.photo)}
                                    alt={model.name}
                                    fill
                                    quality={90}
                                    priority={idx < 4}
                                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 33vw, 300px"
                                    className="model-list__photo"
                                    style={{ objectFit: "cover" }}
                                />
                                <span className={`model-list__badge ${available ? "green" : "red"}`}>
                  {available ? "Available" : "Not Available"}
                </span>
                            </div>

                            <div className="model-list__info">
                                <h3 className="model-list__name">{model.name}</h3>
                                <p className="model-list__detail">
                                    <b>ID:</b> {model._id}
                                </p>
                                <p className="model-list__detail">
                                    <b>City:</b> {city}
                                </p>
                                <p className="model-list__detail">
                                    <b>Period:</b> {period}
                                </p>

                                <div className="model-list__actions">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setEditCtx({ open: true, slug: model.slug, title: model.name })}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ModelUpsertModal
                open={createOpen}
                mode="create"
                onClose={() => setCreateOpen(false)}
                onSubmit={(payload) => submitCreate(payload as ModelValues)}
                onSaved={(created) => {
                    setModels((prev) => [created as ModelCard, ...prev]);
                }}
                initialValues={{
                    languages: ["English"],
                    availability: [{ city: "", startDate: "", endDate: "" }],
                }}
            />

            <ModelUpsertModal
                open={editCtx.open}
                mode="edit"
                onClose={() => setEditCtx({ open: false })}
                context={{ slug: editCtx.slug, title: editCtx.title }}
                onSubmit={(payload) => submitEdit(payload as Partial<ModelValues>)}
                onSaved={(updated) => {
                    const up = updated as Partial<ModelCard> & { slug: string };
                    setModels((prev) => prev.map((m) => (m.slug === up.slug ? { ...m, ...up } : m)));
                }}
            />
        </div>
    );
};

export default ModelList;
