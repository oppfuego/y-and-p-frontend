import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeSegment(s: string) {
    return s.replace(/[^a-zA-Z0-9-_./]/g, "").replace(/\.\./g, "");
}

export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const destRaw = (form.get("dest") as string) || "models/tmp";
        const dest = safeSegment(destRaw);

        const files = form.getAll("files") as File[];
        if (!files || !files.length) {
            return NextResponse.json({ message: "No files" }, { status: 400 });
        }

        const publicRoot = path.join(process.cwd(), "public");
        const targetDir = path.join(publicRoot, "uploads", dest);

        await mkdir(targetDir, { recursive: true });

        const saved = [];
        for (const f of files) {
            const arrayBuffer = await f.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
            const base = f.name.replace(/\.[^.]+$/, "");
            const rnd = crypto.randomBytes(6).toString("hex");
            const filename = `${base}-${Date.now()}-${rnd}.${ext}`;
            const fullPath = path.join(targetDir, filename);
            await writeFile(fullPath, buffer);
            const publicUrl = `/uploads/${dest}/${filename}`;
            saved.push({ filename, url: publicUrl, size: buffer.length, type: f.type || "image/*" });
        }

        return NextResponse.json({ files: saved }, { status: 201 });
    } catch (e: unknown) {
        let message = "Upload failed";
        if (e instanceof Error) message = e.message;
        return NextResponse.json({ message }, { status: 500 });
    }
}
