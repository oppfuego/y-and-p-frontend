import mongoose, { Schema, models } from "mongoose";

const PriceItemSchema = new Schema({ duration: String, price: String }, { _id: false });
const PricingSchema = new Schema({ incall: [PriceItemSchema], outcall: [PriceItemSchema] }, { _id: false });

const TimeRangeSchema = new Schema({ start: String, end: String, endNextDay: Boolean }, { _id: false });
const DayScheduleSchema = new Schema({ day: String, ranges: [TimeRangeSchema] }, { _id: false });
const ScheduleSchema = new Schema({ timezone: String, days: [DayScheduleSchema] }, { _id: false });

const AvailabilitySchema = new Schema({ city: String, startDate: String, endDate: String, address: String }, { _id: false });

const ModelSchema = new Schema(
    {
        slug: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        age: Number,
        nationality: String,
        languages: { type: [String], default: [] },
        smoking: { type: Boolean, default: false },
        drinking: { type: Boolean, default: false },
        snowParty: { type: Boolean, default: false },
        eyeColor: String,
        hairColor: String,
        dressSize: String,
        shoeSize: Number,
        heightCm: Number,
        weightKg: Number,
        cupSize: String,
        tattoo: { type: Boolean, default: false },
        piercing: { type: Boolean, default: false },
        silicone: { type: Boolean, default: false },
        city: { type: String, required: true },
        availability: { type: [AvailabilitySchema], default: [] },
        schedule: { type: ScheduleSchema },
        photo: String,
        gallery: { type: [String], default: [] },
        videoUrl: String,
        pricing: { type: PricingSchema, default: {} }
    },
    { timestamps: true }
);

ModelSchema.index({ slug: 1 }, { unique: true });
ModelSchema.index({ city: 1 });
ModelSchema.index({ updatedAt: -1 });

export default models.Model || mongoose.model("Model", ModelSchema, "models");
