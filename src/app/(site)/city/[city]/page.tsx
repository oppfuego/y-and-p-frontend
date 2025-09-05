"use client";

import { useParams } from "next/navigation";
import Stories from "@/components/stories/Stories";
import ModelCatalog from "@/components/model/model-catalog/ModelCatalog";

export default function Page() {
    const params = useParams<{ city: string }>();
    const cityName = params.city as string;
    return (
        <>
            <Stories city={cityName} />
            <ModelCatalog city={cityName} />
        </>
    );
}
