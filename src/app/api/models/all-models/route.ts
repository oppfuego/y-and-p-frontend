import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";

export const runtime = "nodejs";

export async function GET() {
    try {
        await dbConnect();
        const docs = await Model.find({}, "slug name photo availability updatedAt")
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json(docs);
    } catch (e: unknown) {
        let message = "Failed to fetch models list";
        if (e instanceof Error) message = e.message;
        return NextResponse.json({ message }, { status: 500 });
    }
}
