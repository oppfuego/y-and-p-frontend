import path from "node:path";
import { config } from "dotenv";
config({ path: path.resolve(process.cwd(), ".env.local") });
import mongoose from "mongoose";
import Model from "../db/Model";

async function main() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || "yandp";

    if (!uri) {
        console.error("❌ MONGODB_URI відсутній. Перевір .env у корені проєкту.");
        process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB…");
    await mongoose.connect(uri, { dbName });
    console.log("✅ Connected");

    const data = [
        {
            slug: "kornelia-k1",
            name: "Kornelia",
            city: "milan",
            age: 21,
            nationality: "Ukrainian",
            languages: ["English"],
            smoking: false,
            drinking: false,
            snowParty: false,
            eyeColor: "Blue",
            hairColor: "Blond",
            dressSize: "S",
            shoeSize: 37,
            heightCm: 168,
            weightKg: 50,
            cupSize: "B",
            tattoo: true,
            piercing: true,
            silicone: false,
            availability: [{ city: "Milano", startDate: "2025-08-15", endDate: "2025-08-30" }],
            schedule: {
                timezone: "Europe/Rome",
                days: [
                    { day: "mon", ranges: [{ start: "10:00", end: "00:00", endNextDay: true }] },
                    { day: "tue", ranges: [{ start: "10:00", end: "00:00", endNextDay: true }] },
                    { day: "wed", ranges: [{ start: "10:00", end: "00:00", endNextDay: true }] },
                    { day: "thu", ranges: [{ start: "10:00", end: "00:00", endNextDay: true }] },
                    { day: "fri", ranges: [{ start: "10:00", end: "00:00", endNextDay: true }] },
                    { day: "sat", ranges: [{ start: "10:00", end: "00:00", endNextDay: true }] },
                    { day: "sun", ranges: [{ start: "10:00", end: "00:00", endNextDay: true }] },
                ],
            },
            photo: "src/assets/images/kornella/kornella-cover.png",
            gallery: [
                "src/assets/images/kornella/kornella-2.png",
                "src/assets/images/kornella/kornella-3.png",
                "src/assets/images/kornella/kornella-4.png",
            ],
            pricing: {
                incall: [
                    { duration: "30 min", price: "150€" },
                    { duration: "1h", price: "200€" },
                    { duration: "2h", price: "400€" },
                ],
                outcall: [
                    { duration: "1h", price: "350€" },
                    { duration: "2h", price: "500€" },
                    { duration: "3h", price: "750€" },
                ],
            },
            createdAt: "2025-08-20T10:00:00.000Z",
            updatedAt: "2025-08-20T10:00:00.000Z",
        },
        {
            slug: "anastasia-a1",
            name: "Anastasia",
            city: "milan",
            age: 22,
            nationality: "Ukrainian",
            languages: ["English", "Italian"],
            eyeColor: "Blue",
            hairColor: "Blond",
            dressSize: "S",
            shoeSize: 37,
            heightCm: 176,
            cupSize: "B",
            pricing: {
                incall: [
                    { duration: "30 min", price: "150€" },
                    { duration: "1h", price: "200€" },
                ],
                outcall: [{ duration: "1h", price: "350€" }],
            },
            photo: "https://res.cloudinary.com/<cloud>/image/upload/models/anastasia-a1/cover.jpg",
        },
    ];

    let upserts = 0;
    for (const item of data) {
        await Model.findOneAndUpdate({ slug: item.slug }, { $set: item }, { upsert: true, new: true });
        upserts++;
    }

    const count = await Model.countDocuments();
    console.log(`🌱 Seeded/updated: ${upserts} docs. Total in collection: ${count}`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected");
}

main().catch((err) => {
    console.error("❗ Seed failed:", err);
    process.exit(1);
});
