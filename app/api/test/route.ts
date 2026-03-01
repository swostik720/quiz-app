import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
    try {
        await connectDB();

        return NextResponse.json({
            message: "Connected to MongoDB",
        });
    } catch (error: unknown) {
        return NextResponse.json({

            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
        },
            { status: 500 }
        );
    }
}
