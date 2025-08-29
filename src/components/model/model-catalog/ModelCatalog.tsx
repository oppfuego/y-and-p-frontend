import "./ModelCatalog.scss";
import ModelCard from "@/components/model/model-card/ModelCard";
import { MODELS } from "@/configs/models";
import { isAvailableNow, canonCity } from "@/utils/availability";

export default function ModelCatalog({ city }: { city: string }) {
    const items = MODELS.filter(m => isAvailableNow(m.availability, city) && canonCity(m.city) === canonCity(city));
    return (
        <div className="model-catalog">
            <h1 className="model-catalog__title">Available Models</h1>
            <section className="model-catalog__grid" aria-label="Model catalog">
                {items.map((it, idx) => (
                    <ModelCard key={it.id} src={it.photo} name={it.name} href={`/city/${canonCity(city)}/model/${it.slug}`} priority={idx < 2} />
                ))}
            </section>
        </div>
    );
}
