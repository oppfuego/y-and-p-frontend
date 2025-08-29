import { notFound } from "next/navigation";
import { getModelBySlug } from "@/configs/models";
import ModelHero from "@/components/model/model-hero/ModelHero";
import ModelSlider from "@/components/model/model-slider/ModelSlider";
import ModelMeta from "@/components/model/model-meta/ModelMeta";
import ModelPricing from "@/components/model/model-pricing/ModelPricing";
import ModelAvailability from "@/components/model/model-availability/ModelAvailability";

export default function ModelPage({ params }: { params: { city: string; slug: string } }) {
    const model = getModelBySlug(params.slug);
    if (!model || model.city !== params.city) return notFound();
    const gallery = [model.photo, ...(model.gallery ?? [])];

    return (
        <main>
            <ModelHero model={model} city={params.city} />
            <ModelSlider images={gallery} name={model.name} />
            <ModelMeta model={model} />
            {model.pricing && model.pricing.length > 0 && <ModelPricing pricing={model.pricing} name={model.name} />}
            {model.availability && model.availability.length > 0 && <ModelAvailability availability={model.availability} />}
        </main>
    );
}
