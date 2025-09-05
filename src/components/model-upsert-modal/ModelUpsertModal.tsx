"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Stack,
    Button,
    FormControlLabel,
    Switch,
    Divider,
    Typography,
    Alert,
    CircularProgress,
    Chip,
    IconButton,
    Autocomplete,
    ImageList,
    ImageListItem,
    Tooltip,
    MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NextImage from "next/image";

type Availability = { city: string; startDate: string; endDate: string };
type PriceItem = { duration: string; price: string };
type Pricing = { incall?: PriceItem[]; outcall?: PriceItem[] };

export type ModelValues = {
    _id?: string;
    slug?: string;
    name: string;

    photo?: string;
    gallery?: string[];

    age?: number;
    nationality?: string;
    languages?: string[];
    eyeColor?: string;
    hairColor?: string;
    dressSize?: string;
    shoeSize?: number;
    heightCm?: number;
    weightKg?: number;
    cupSize?: string;
    smoking?: boolean;
    drinking?: boolean;
    snowParty?: boolean;
    tattoo?: boolean;
    piercing?: boolean;
    silicone?: boolean;

    availability: Availability[];
    pricing?: Pricing;

    videoUrl?: string;
};

type Mode = "create" | "edit";

type SubmitPayload = unknown;
type SubmitResult = unknown;

type Props = {
    open: boolean;
    mode: Mode;
    onClose: () => void;
    context?: { slug?: string; title?: string };
    initialValues?: Partial<ModelValues>;
    fetchUrlBuilder?: (slug: string) => string;
    onSubmit: (payload: SubmitPayload, mode: Mode) => Promise<SubmitResult>;
    onSaved?: (doc: SubmitResult) => void;
};

const LANGUAGE_OPTIONS = [
    "English",
    "Italian",
    "Ukrainian",
    "Russian",
    "Polish",
    "German",
    "French",
    "Spanish",
    "Portuguese",
    "Romanian",
    "Czech",
    "Slovak",
    "Hungarian",
    "Greek",
    "Turkish",
    "Dutch",
    "Swedish",
    "Norwegian",
    "Danish",
    "Finnish",
    "Arabic",
    "Hebrew",
    "Chinese",
    "Japanese",
    "Korean",
];

// dropdown options
const DRESS_SIZE_OPTIONS = [
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "EU 32",
    "EU 34",
    "EU 36",
    "EU 38",
    "EU 40",
    "EU 42",
    "EU 44",
    "EU 46",
];
const EYE_COLOR_OPTIONS = ["Blue", "Green", "Brown", "Hazel", "Grey", "Amber", "Black"];
const HAIR_COLOR_OPTIONS = ["Blonde", "Brown", "Black", "Red", "Auburn", "Chestnut", "Grey", "White", "Dyed", "Highlights"];

// Нормалізація шляхів для next/image
const normalizeSrc = (s?: string) => {
    if (!s) return "/images/placeholder.jpg";
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:") || s.startsWith("data:")) return s;
    return s.startsWith("/") ? s : `/${s}`;
};

const toSlug = (s: string) =>
    s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

/** Локальний прев’ю з File */
const filePreview = (f: File | null) => (f ? URL.createObjectURL(f) : "");

/** Типи відповіді бекенда аплоада */
type UploadApiFile = { url: string };
type UploadApiResponse = { files?: UploadApiFile[]; message?: string };

/** Завантаження файлів на сервер */
async function uploadFiles(files: File[], destFolder: string) {
    if (!files.length) return [] as string[];
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("dest", destFolder); // напр.: models/<slug>

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = (await res.json()) as UploadApiResponse;
    if (!res.ok) throw new Error(data?.message || "Upload failed");
    // віддамо масив URLів виду /uploads/models/<slug>/...
    return (data?.files ?? []).map((x) => x.url);
}

// тумблери
type BoolKey = Extract<
    keyof ModelValues,
    "smoking" | "drinking" | "snowParty" | "tattoo" | "piercing" | "silicone"
>;
const TOGGLE_FIELDS: ReadonlyArray<{ key: BoolKey; label: string }> = [
    { key: "smoking", label: "Smoking" },
    { key: "drinking", label: "Drinking" },
    { key: "snowParty", label: "Snow party" },
    { key: "tattoo", label: "Tattoo" },
    { key: "piercing", label: "Piercing" },
    { key: "silicone", label: "Silicone" },
];

export default function ModelUpsertModal({
                                             open,
                                             mode,
                                             onClose,
                                             context,
                                             initialValues,
                                             fetchUrlBuilder,
                                             onSubmit,
                                             onSaved,
                                         }: Props) {
    const [values, setValues] = useState<ModelValues | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const originalRef = useRef<ModelValues | null>(null);
    const [slugTouched, setSlugTouched] = useState(false);

    // cover upload state
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>("");

    // натуральні розміри cover для next/image
    const [coverWH, setCoverWH] = useState<{ w: number; h: number } | null>(null);

    // gallery upload state
    const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);

    const title = mode === "create" ? "Add new model" : `Edit: ${context?.title ?? context?.slug ?? ""}`;

    useEffect(() => {
        // cleanup object URLs on unmount / close
        return () => {
            if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
            galleryNewFiles.forEach((f) => URL.revokeObjectURL(URL.createObjectURL(f)));
        };
    }, [coverPreviewUrl, galleryNewFiles]);

    // ініціалізація форми
    useEffect(() => {
        const init = async () => {
            if (!open) return;

            const baseline: ModelValues = {
                name: "",
                photo: "",
                gallery: [],
                languages: [],
                nationality: "",
                availability: [{ city: "", startDate: "", endDate: "" }],
                pricing: { incall: [], outcall: [] },
                smoking: false,
                drinking: false,
                snowParty: false,
                tattoo: false,
                piercing: false,
                silicone: false,
                videoUrl: "",
            };

            setCoverFile(null);
            setCoverPreviewUrl("");
            setGalleryNewFiles([]);

            if (mode === "create") {
                const merged: ModelValues = {
                    ...baseline,
                    ...initialValues,
                    slug: initialValues?.slug ?? "",
                    name: initialValues?.name ?? "",
                    languages: initialValues?.languages ?? [],
                    gallery: initialValues?.gallery ?? [],
                    availability:
                        initialValues?.availability?.length ? [{ ...initialValues.availability[0] }] : baseline.availability,
                    pricing: {
                        incall: initialValues?.pricing?.incall ?? [],
                        outcall: initialValues?.pricing?.outcall ?? [],
                    },
                };
                originalRef.current = null;
                setValues(merged);
                setError(null);
                setLoading(false);
                return;
            }

            // EDIT
            if (context?.slug) {
                try {
                    setLoading(true);
                    setError(null);
                    const url = fetchUrlBuilder ? fetchUrlBuilder(context.slug) : `/api/models/${context.slug}`;
                    const res = await fetch(url, { cache: "no-store" });
                    const full = await res.json();
                    if (!res.ok) throw new Error((full && (full.message as string)) || "Failed to load model");

                    const normalized: ModelValues = {
                        ...baseline,
                        ...full,
                        languages: (full.languages as string[] | undefined) ?? [],
                        gallery: (full.gallery as string[] | undefined) ?? [],
                        availability: full.availability?.length ? [{ ...full.availability[0] }] : baseline.availability,
                        pricing: {
                            incall: full.pricing?.incall ?? [],
                            outcall: full.pricing?.outcall ?? [],
                        },
                    };
                    originalRef.current = normalized;
                    setValues(normalized);
                } catch (e: unknown) {
                    setError(e instanceof Error ? e.message : "Failed to load model");
                } finally {
                    setLoading(false);
                }
                return;
            }

            // edit без slug — беремо initialValues
            const merged: ModelValues = {
                ...baseline,
                ...initialValues,
                languages: initialValues?.languages ?? [],
                gallery: initialValues?.gallery ?? [],
                availability: initialValues?.availability?.length ? [{ ...initialValues.availability[0] }] : baseline.availability,
                pricing: {
                    incall: initialValues?.pricing?.incall ?? [],
                    outcall: initialValues?.pricing?.outcall ?? [],
                },
            };
            originalRef.current = merged;
            setValues(merged);
            setError(null);
            setLoading(false);
        };

        init();
    }, [open, mode, context?.slug, fetchUrlBuilder, initialValues]);

    const computeDiff = (from: ModelValues | null, to: ModelValues | null) => {
        if (!from || !to) return {};
        const diff: Record<string, unknown> = {};
        const shallow: (keyof ModelValues)[] = [
            "name",
            "photo",
            "age",
            "nationality",
            "eyeColor",
            "hairColor",
            "dressSize",
            "shoeSize",
            "heightCm",
            "weightKg",
            "cupSize",
            "smoking",
            "drinking",
            "snowParty",
            "tattoo",
            "piercing",
            "silicone",
            "videoUrl",
        ];
        for (const k of shallow) if (from[k] !== to[k]) diff[k as string] = to[k];

        const jsonEq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
        if (!jsonEq(from.languages ?? [], to.languages ?? [])) diff.languages = to.languages ?? [];
        if (!jsonEq(from.gallery ?? [], to.gallery ?? [])) diff.gallery = to.gallery ?? [];
        if (!jsonEq(from.availability ?? [], to.availability ?? [])) diff.availability = to.availability ?? [];

        // pricing
        if (!jsonEq(from.pricing?.incall ?? [], to.pricing?.incall ?? [])) {
            diff.pricing = { ...(diff.pricing as object | undefined), incall: to.pricing?.incall ?? [] };
        }
        if (!jsonEq(from.pricing?.outcall ?? [], to.pricing?.outcall ?? [])) {
            diff.pricing = { ...(diff.pricing as object | undefined), outcall: to.pricing?.outcall ?? [] };
        }

        return diff;
    };

    const diffPayload = useMemo(() => computeDiff(originalRef.current, values), [values]);

    const set = <K extends keyof ModelValues>(key: K, val: ModelValues[K]) =>
        setValues((v) => (v ? { ...v, [key]: val } : v));

    const setAvailability = (part: Partial<Availability>) =>
        setValues((v) => (v ? { ...v, availability: [{ ...v.availability[0], ...part }] } : v));

    // pricing helpers
    const addPriceRow = (kind: "incall" | "outcall") =>
        setValues((v) => {
            if (!v) return v;
            const next = { ...(v.pricing ?? { incall: [], outcall: [] }) };
            next[kind] = [...(next[kind] ?? []), { duration: "", price: "" }];
            return { ...v, pricing: next };
        });

    const setPriceRow = (kind: "incall" | "outcall", i: number, patch: Partial<PriceItem>) =>
        setValues((v) => {
            if (!v) return v;
            const next = { ...(v.pricing ?? { incall: [], outcall: [] }) };
            const arr = [...(next[kind] ?? [])];
            arr[i] = { ...arr[i], ...patch };
            next[kind] = arr;
            return { ...v, pricing: next };
        });

    const removePriceRow = (kind: "incall" | "outcall", i: number) =>
        setValues((v) => {
            if (!v) return v;
            const next = { ...(v.pricing ?? { incall: [], outcall: [] }) };
            const arr = [...(next[kind] ?? [])];
            arr.splice(i, 1);
            next[kind] = arr;
            return { ...v, pricing: next };
        });

    const canSubmit = useMemo(() => {
        if (!values) return false;
        const a = values.availability?.[0];
        if (mode === "create") {
            return Boolean(values.slug && values.name && a?.city && a?.startDate && a?.endDate);
        }
        return true;
    }, [mode, values]);

    const handleNameChange = (v: string) => {
        if (mode !== "create") {
            set("name", v);
            return;
        }
        setValues((prev) => {
            if (!prev) return prev;
            const next = { ...prev, name: v };
            if (!slugTouched) next.slug = toSlug(v);
            return next;
        });
    };

    // ---- COVER handlers ----
    const onPickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setCoverFile(f);
        const u = filePreview(f);
        setCoverPreviewUrl(u);
    };
    const setCoverFromGallery = (url: string) => {
        set("photo", url);
        setCoverFile(null);
        setCoverPreviewUrl("");
    };
    const removeCover = () => {
        set("photo", "");
        setCoverFile(null);
        setCoverPreviewUrl("");
    };

    // ---- GALLERY handlers ----
    const onPickGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setGalleryNewFiles((prev) => [...prev, ...files]);
    };
    const removeGalleryExisting = (url: string) => {
        set("gallery", (values?.gallery ?? []).filter((x) => x !== url));
    };
    const removeGalleryNew = (idx: number) => {
        setGalleryNewFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    // ---- SUBMIT ----
    const onSubmitClick = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!values) return;

        const slug = (mode === "create" ? values.slug : context?.slug) || "tmp";
        const dest = `models/${slug}`;

        let uploadedCoverUrl: string | undefined;
        if (coverFile) {
            const [u] = await uploadFiles([coverFile], dest);
            uploadedCoverUrl = u;
        }

        let uploadedGalleryUrls: string[] = [];
        if (galleryNewFiles.length) {
            uploadedGalleryUrls = await uploadFiles(galleryNewFiles, dest);
        }

        if (mode === "create") {
            const payload = {
                slug: values.slug,
                name: values.name,
                photo: uploadedCoverUrl ?? (values.photo || undefined),
                gallery: [...(values.gallery ?? []), ...uploadedGalleryUrls],

                age: values.age,
                nationality: values.nationality?.trim() || undefined,
                languages: values.languages ?? [],
                eyeColor: values.eyeColor,
                hairColor: values.hairColor,
                dressSize: values.dressSize,
                shoeSize: values.shoeSize,
                heightCm: values.heightCm,
                weightKg: values.weightKg,
                cupSize: values.cupSize,
                smoking: values.smoking ?? false,
                drinking: values.drinking ?? false,
                snowParty: values.snowParty ?? false,
                tattoo: values.tattoo ?? false,
                piercing: values.piercing ?? false,
                silicone: values.silicone ?? false,

                availability: values.availability,
                pricing: values.pricing,

                videoUrl: values.videoUrl?.trim() || undefined,
            };
            setSaving(true);
            setError(null);
            try {
                const saved = await onSubmit(payload, "create");
                onSaved?.(saved);
                onClose();
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to create");
            } finally {
                setSaving(false);
            }
            return;
        }

        const finalPhoto = uploadedCoverUrl ?? values.photo;
        const finalGallery = [...(values.gallery ?? []), ...uploadedGalleryUrls];
        setValues((v) => (v ? { ...v, photo: finalPhoto, gallery: finalGallery } : v));

        const payloadBase = {
            ...diffPayload,
            ...(uploadedCoverUrl ? { photo: uploadedCoverUrl } : {}),
            ...(uploadedGalleryUrls.length ? { gallery: finalGallery } : {}),
        };

        const payload = Object.keys(payloadBase).length ? payloadBase : {};
        if (!Object.keys(payload).length) {
            onClose();
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const saved = await onSubmit(payload, "edit");
            onSaved?.(saved);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update");
        } finally {
            setSaving(false);
        }
    };

    // ui helpers
    const coverUrlRaw = coverFile ? coverPreviewUrl : values?.photo || "/images/placeholder.jpg";
    const coverUrl = normalizeSrc(coverUrlRaw);

    // Завантажуємо натуральні розміри для next/image (щоб не ставити width/height=0)
    useEffect(() => {
        setCoverWH(null);
        if (!coverUrl) return;
        if (typeof window === "undefined") return;
        const imgEl = new window.Image();
        imgEl.src = coverUrl;
        imgEl.onload = () => {
            const w = imgEl.naturalWidth || 800;
            const h = imgEl.naturalHeight || 600;
            setCoverWH({ w, h });
        };
    }, [coverUrl]);

    const coverIsExternalOrBlob =
        coverUrl.startsWith("http://") || coverUrl.startsWith("https://") || coverUrl.startsWith("blob:") || coverUrl.startsWith("data:");

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { overflowX: "hidden" } }}>
            <DialogTitle
                sx={{
                    px: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {title}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, overflowX: "hidden" }}>
                {loading ? (
                    <Stack alignItems="center" py={4}>
                        <CircularProgress />
                    </Stack>
                ) : !values ? (
                    <Alert severity="error">{error || "No data"}</Alert>
                ) : (
                    <form onSubmit={onSubmitClick}>
                        <Stack spacing={3}>
                            {/* COVER */}
                            <Stack spacing={1}>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    Cover photo
                                </Typography>

                                {/* Центрована, збереження пропорцій, натуральні розміри */}
                                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                                    <NextImage
                                        src={coverUrl}
                                        alt="cover"
                                        width={coverWH?.w ?? 800}
                                        height={coverWH?.h ?? 600}
                                        unoptimized={coverIsExternalOrBlob}
                                        priority
                                        sizes="(max-width: 900px) 100vw, 800px"
                                        style={{
                                            maxWidth: "100%",
                                            height: "auto",
                                            borderRadius: 12,
                                            display: "block",
                                        }}
                                    />
                                </div>

                                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                                    <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon />}>
                                        Upload cover
                                        <input hidden accept="image/*" type="file" onChange={onPickCover} />
                                    </Button>
                                    {values.gallery?.length ? (
                                        <Tooltip title="Set from first gallery image (click a thumbnail to choose any)">
                      <span>
                        <Button variant="text" onClick={() => setCoverFromGallery(values.gallery![0])} startIcon={<CheckCircleIcon />}>
                          Use first gallery as cover
                        </Button>
                      </span>
                                        </Tooltip>
                                    ) : null}
                                    {(values.photo || coverFile) && (
                                        <Button variant="text" color="error" onClick={removeCover} startIcon={<DeleteOutlineIcon />}>
                                            Remove cover
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>

                            <Divider />

                            {/* BASIC FIELDS */}
                            <Grid container spacing={2}>
                                {mode === "create" ? (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField label="Name *" fullWidth value={values.name} onChange={(e) => handleNameChange(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Slug * (lowercase, hyphens)"
                                                fullWidth
                                                value={values.slug ?? ""}
                                                onChange={(e) => {
                                                    setSlugTouched(true);
                                                    set("slug", toSlug(e.target.value));
                                                }}
                                            />
                                        </Grid>
                                    </>
                                ) : (
                                    <Grid item xs={12}>
                                        <TextField label="Name" fullWidth value={values.name} onChange={(e) => set("name", e.target.value)} />
                                    </Grid>
                                )}

                                <Grid item xs={12} sm={6}>
                                    <TextField label="Nationality" fullWidth value={values.nationality ?? ""} onChange={(e) => set("nationality", e.target.value)} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField label="Video URL" fullWidth value={values.videoUrl ?? ""} onChange={(e) => set("videoUrl", e.target.value)} />
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField label="Age" type="number" fullWidth value={values.age ?? ""} onChange={(e) => set("age", Number(e.target.value) || undefined)} />
                                </Grid>

                                {/* dropdowns */}
                                <Grid item xs={12} sm={3}>
                                    <TextField select label="Dress size" fullWidth value={values.dressSize ?? ""} onChange={(e) => set("dressSize", e.target.value)}>
                                        <MenuItem value="" disabled>
                                            Select…
                                        </MenuItem>
                                        {DRESS_SIZE_OPTIONS.map((opt) => (
                                            <MenuItem key={opt} value={opt}>
                                                {opt}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField select label="Eye color" fullWidth value={values.eyeColor ?? ""} onChange={(e) => set("eyeColor", e.target.value)}>
                                        <MenuItem value="" disabled>
                                            Select…
                                        </MenuItem>
                                        {EYE_COLOR_OPTIONS.map((opt) => (
                                            <MenuItem key={opt} value={opt}>
                                                {opt}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField select label="Hair color" fullWidth value={values.hairColor ?? ""} onChange={(e) => set("hairColor", e.target.value)}>
                                        <MenuItem value="" disabled>
                                            Select…
                                        </MenuItem>
                                        {HAIR_COLOR_OPTIONS.map((opt) => (
                                            <MenuItem key={opt} value={opt}>
                                                {opt}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        label="Height (cm)"
                                        type="number"
                                        fullWidth
                                        value={values.heightCm ?? ""}
                                        onChange={(e) => set("heightCm", Number(e.target.value) || undefined)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        label="Weight (kg)"
                                        type="number"
                                        fullWidth
                                        value={values.weightKg ?? ""}
                                        onChange={(e) => set("weightKg", Number(e.target.value) || undefined)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        label="Shoe size"
                                        type="number"
                                        fullWidth
                                        value={values.shoeSize ?? ""}
                                        onChange={(e) => set("shoeSize", Number(e.target.value) || undefined)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField label="Cup size" fullWidth value={values.cupSize ?? ""} onChange={(e) => set("cupSize", e.target.value)} />
                                </Grid>

                                {/* Languages */}
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        options={LANGUAGE_OPTIONS}
                                        value={values.languages ?? []}
                                        onChange={(_e, newValue) => {
                                            const list = (newValue as readonly string[]) || [];
                                            const arr = Array.from(new Set(list.map((v) => v.trim()).filter(Boolean)));
                                            set("languages", arr);
                                        }}
                                        renderTags={(value: readonly string[], getTagProps) =>
                                            value.map((option: string, index: number) => (
                                                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                                            ))
                                        }
                                        renderInput={(params) => <TextField {...params} label="Languages" placeholder="Select or type…" />}
                                    />
                                </Grid>

                                {/* Toggles */}
                                <Grid item xs={12}>
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        {TOGGLE_FIELDS.map(({ key, label }) => (
                                            <FormControlLabel
                                                key={key}
                                                control={<Switch checked={Boolean(values[key])} onChange={(e) => set(key, e.target.checked)} />}
                                                label={label}
                                            />
                                        ))}
                                    </Stack>
                                </Grid>
                            </Grid>

                            <Divider />

                            {/* Availability */}
                            <Typography variant="subtitle1" fontWeight={700}>
                                Availability {mode === "create" ? "(required)" : ""}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="City"
                                        fullWidth
                                        value={values.availability[0].city}
                                        onChange={(e) => setAvailability({ city: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Start date"
                                        type="date"
                                        fullWidth
                                        value={values.availability[0].startDate}
                                        onChange={(e) => setAvailability({ startDate: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="End date"
                                        type="date"
                                        fullWidth
                                        value={values.availability[0].endDate}
                                        onChange={(e) => setAvailability({ endDate: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>

                            <Divider />

                            {/* PRICING */}
                            <Typography variant="subtitle1" fontWeight={700}>
                                Pricing
                            </Typography>
                            <Grid container spacing={2}>
                                {/* INCALL */}
                                <Grid item xs={12} md={6}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight={600}>
                                            Incall
                                        </Typography>
                                        <Button size="small" variant="outlined" onClick={() => addPriceRow("incall")}>
                                            + Add
                                        </Button>
                                    </Stack>
                                    <Stack spacing={1}>
                                        {(values.pricing?.incall ?? []).map((row, i) => (
                                            <Grid key={`incall-${i}`} container spacing={1}>
                                                <Grid item xs={5}>
                                                    <TextField
                                                        label="Duration"
                                                        fullWidth
                                                        value={row.duration}
                                                        onChange={(e) => setPriceRow("incall", i, { duration: e.target.value })}
                                                    />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField label="Price" fullWidth value={row.price} onChange={(e) => setPriceRow("incall", i, { price: e.target.value })} />
                                                </Grid>
                                                <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
                                                    <Button color="error" onClick={() => removePriceRow("incall", i)}>
                                                        Remove
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        {!(values.pricing?.incall?.length) && (
                                            <Typography variant="body2" color="text.secondary">
                                                No incall items
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>

                                {/* OUTCALL */}
                                <Grid item xs={12} md={6}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight={600}>
                                            Outcall
                                        </Typography>
                                        <Button size="small" variant="outlined" onClick={() => addPriceRow("outcall")}>
                                            + Add
                                        </Button>
                                    </Stack>
                                    <Stack spacing={1}>
                                        {(values.pricing?.outcall ?? []).map((row, i) => (
                                            <Grid key={`outcall-${i}`} container spacing={1}>
                                                <Grid item xs={5}>
                                                    <TextField
                                                        label="Duration"
                                                        fullWidth
                                                        value={row.duration}
                                                        onChange={(e) => setPriceRow("outcall", i, { duration: e.target.value })}
                                                    />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField label="Price" fullWidth value={row.price} onChange={(e) => setPriceRow("outcall", i, { price: e.target.value })} />
                                                </Grid>
                                                <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
                                                    <Button color="error" onClick={() => removePriceRow("outcall", i)}>
                                                        Remove
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        {!(values.pricing?.outcall?.length) && (
                                            <Typography variant="body2" color="text.secondary">
                                                No outcall items
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>

                            <Divider />

                            {/* GALLERY */}
                            <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        Gallery
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon />}>
                                            Add images
                                            <input hidden accept="image/*" type="file" multiple onChange={onPickGallery} />
                                        </Button>
                                    </Stack>
                                </Stack>

                                {(values.gallery ?? []).length > 0 && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">
                                            Existing
                                        </Typography>
                                        <ImageList cols={4} gap={8} sx={{ m: 0, overflow: "hidden" }}>
                                            {(values.gallery ?? []).map((rawUrl) => {
                                                const url = normalizeSrc(rawUrl);
                                                const unopt = url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:");
                                                return (
                                                    <ImageListItem key={url} sx={{ position: "relative" }}>
                                                        <div
                                                            style={{
                                                                position: "relative",
                                                                width: "100%",
                                                                paddingTop: "100%",
                                                                borderRadius: 8,
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            <NextImage src={url} alt="gallery" fill unoptimized={unopt} style={{ objectFit: "cover" }} />
                                                            <Stack direction="row" spacing={1} sx={{ position: "absolute", top: 6, right: 6 }}>
                                                                <Tooltip title="Set as cover">
                                                                    <IconButton size="small" color="primary" onClick={() => setCoverFromGallery(url)}>
                                                                        <CheckCircleIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Remove">
                                                                    <IconButton size="small" color="error" onClick={() => removeGalleryExisting(rawUrl)}>
                                                                        <DeleteOutlineIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </div>
                                                    </ImageListItem>
                                                );
                                            })}
                                        </ImageList>
                                    </>
                                )}

                                {galleryNewFiles.length > 0 && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">
                                            New (to upload)
                                        </Typography>
                                        <ImageList cols={4} gap={8} sx={{ m: 0, overflow: "hidden" }}>
                                            {galleryNewFiles.map((f, idx) => {
                                                const u = URL.createObjectURL(f);
                                                return (
                                                    <ImageListItem key={idx} sx={{ position: "relative" }}>
                                                        <div
                                                            style={{
                                                                position: "relative",
                                                                width: "100%",
                                                                paddingTop: "100%",
                                                                borderRadius: 8,
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            <NextImage src={u} alt={`new-${idx}`} fill unoptimized style={{ objectFit: "cover" }} />
                                                            <Stack direction="row" spacing={1} sx={{ position: "absolute", top: 6, right: 6 }}>
                                                                <Tooltip title="Remove">
                                                                    <IconButton size="small" color="error" onClick={() => removeGalleryNew(idx)}>
                                                                        <DeleteOutlineIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </div>
                                                    </ImageListItem>
                                                );
                                            })}
                                        </ImageList>
                                    </>
                                )}
                            </Stack>

                            {error && <Alert severity="error">{error}</Alert>}
                        </Stack>
                    </form>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3 }}>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmitClick}
                    disabled={saving || loading || !canSubmit}
                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                    {mode === "create" ? "Create" : "Save changes"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
