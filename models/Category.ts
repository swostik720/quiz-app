import mongoose, { Schema, models } from "mongoose";

const CategorySchema = new Schema({ 
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
},
    { timestamps: true }
);

export default models.Category || mongoose.model("Category", CategorySchema);