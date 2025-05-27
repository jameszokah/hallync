"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const roomSchema = z.object({
    hostel_id: z.string().uuid(),
    type: z.string().min(2),
    price: z.number().positive(),
    capacity: z.number().int().positive(),
    available: z.number().int().positive(),
    amenities: z.string().optional().transform((val) => {
        if (!val) return {};
        try {
            // Attempt to parse if it's already a JSON string
            const parsed = JSON.parse(val);
            if (typeof parsed === "object" && parsed !== null) return parsed;
        } catch (e) {
            // If parsing fails, assume it's a comma-separated string
            return val.split(",").reduce((acc, curr) => {
                const trimmed = curr.trim();
                if (trimmed) {
                    acc[trimmed.toLowerCase().replace(/\s+/g, "_")] = true;
                }
                return acc;
            }, {} as Record<string, boolean>);
        }
        // If it's not a valid JSON string and not a comma-separated string (e.g. just a word), treat as single amenity
        return val.split(",").reduce((acc, curr) => {
            const trimmed = curr.trim();
            if (trimmed) {
                acc[trimmed.toLowerCase().replace(/\s+/g, "_")] = true;
            }
            return acc;
        }, {} as Record<string, boolean>);
    }),
});

export async function createRoom(roomData: unknown) {
    const supabase = await createClient();

    const parsedData = roomSchema.safeParse(roomData);

    if (!parsedData.success) {
        console.error("Validation Error:", parsedData.error.flatten());
        throw new Error("Invalid room data provided.");
    }

    const {
        hostel_id,
        type,
        price,
        capacity,
        available,
        amenities,
    } = parsedData.data;

    const { data: room, error } = await supabase
        .from("rooms")
        .insert([
            {
                hostel_id,
                type,
                price,
                capacity,
                available,
                amenities,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error("Supabase Error:", error);
        throw new Error(
            `Failed to create room in database: ${error.message} (Code: ${error.code})`,
        );
    }

    // Revalidate the path to update the UI after room creation
    revalidatePath(`/owner/hostels/${hostel_id}/rooms`);
    // Potentially revalidate other relevant paths, e.g., the main hostel page
    revalidatePath(`/hostels/${hostel_id}`);

    return room;
}
