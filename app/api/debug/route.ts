import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        return NextResponse.json({
            message: "Debug information",
            authenticated: !!session,
            session: session
                ? {
                    user: {
                        id: session.user?.id,
                        name: session.user?.name,
                        email: session.user?.email,
                        role: session.user?.role,
                    },
                    expires: session.expires,
                }
                : null,
        });
    } catch (error) {
        console.error("Debug API error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 },
        );
    }
}
