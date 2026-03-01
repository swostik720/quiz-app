import mongoose, { Schema, models } from "mongoose";

const QuestionSchema = new Schema(
    {
        question: { type: String, required: true, trim: true },
        options: {
            type: [{ type: String, required: true }],
            required: true,
            validate: {
                validator: (arr: string[]) => Array.isArray(arr) && arr.length === 4,
                message: "Options must contain exactly 4 values",
            },
        },
        correctAnswer: { type: Number, required: true, min: 0, max: 3 },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "easy",
        },
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

QuestionSchema.index({ category: 1, createdAt: -1 });

export default models.Question || mongoose.model("Question", QuestionSchema);