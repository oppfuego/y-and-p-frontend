import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";

export async function GET() {
    try {
        const conn = await dbConnect();
        const { connection } = conn;
        if (!connection.db) {
            return NextResponse.json({ ok: false, error: "Database connection is undefined" }, { status: 500 });
        }
        const ping = await connection.db.admin().ping();
        return NextResponse.json({
            ok: true,
            db: connection.name,
            host: connection.host,
            state: connection.readyState,
            ping,
        });
    } catch (e: unknown) {
        let errorMsg = "Unknown error";
        if (e instanceof Error) errorMsg = e.message;
        return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
    }
}
