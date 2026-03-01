import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true,
    },

    score: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },

    answers: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
                required: true
            },
            selected: { type: Number, required: true, min: 0, max: 3 },
            correct: { type: Number, required: true, min: 0, max: 3 },
        },
    ],
},
{ timestamps: true }
);

QuizAttemptSchema.index({ categoryId: 1 });

export default mongoose.models.QuizAttempt ||
    mongoose.model("QuizAttempt", QuizAttemptSchema);