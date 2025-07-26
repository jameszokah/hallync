"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const roomSchema = z.object({
    hostel_id: z.string().uuid(),
    type: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    capacity: z.number().int().positive(),
    available: z.number().int().positive(),
    amenities: z.string().transform((val) => {
        if (!val) return {};
        try {
            // Parse if it's already a JSON string
            return JSON.parse(val);
        } catch (e) {
            // If parsing fails, return empty object
            return {};
        }
    }),
    has_bathroom: z.boolean().optional(),
    has_balcony: z.boolean().optional(),
    has_ac: z.boolean().optional(),
    has_tv: z.boolean().optional(),
    has_fridge: z.boolean().optional(),
    is_furnished: z.boolean().optional(),
});

export async function createRoom(formData: any) {
    try {
        // Parse and validate the form data
        const parsedData = roomSchema.parse(formData);

        // Extract data
        const {
            hostel_id,
            type,
            description,
            price,
            capacity,
            available,
            amenities,
            has_bathroom,
            has_balcony,
            has_ac,
            has_tv,
            has_fridge,
            is_furnished,
        } = parsedData;

        // Combine explicit amenities with the amenities object
        const combinedAmenities = {
            ...amenities,
            ...(has_bathroom !== undefined && { has_bathroom }),
            ...(has_balcony !== undefined && { has_balcony }),
            ...(has_ac !== undefined && { has_ac }),
            ...(has_tv !== undefined && { has_tv }),
            ...(has_fridge !== undefined && { has_fridge }),
            ...(is_furnished !== undefined && { is_furnished }),
        };

        // Create the room in the database
        const room = await prisma.room.create({
            data: {
                hostel_id,
                type,
                description,
                price,
                capacity,
                available: true, // Set to true by default
                // Create specified number of identical rooms
                // This is handled differently - we create one room type entry
            },
        });

        // Handle image uploads if they exist
        if (
            formData.images && Array.isArray(formData.images) &&
            formData.images.length > 0
        ) {
            // In a real application, you would upload images to a storage service
            // and save the URLs. Here we'll simulate that process.

            // For demonstration, let's assume we have a helper function to upload images
            // and we're just saving the paths/URLs
            const imageUrls = await Promise.all(
                formData.images.map(async (image: File, index: number) => {
                    // This is a placeholder - in a real app, upload to S3/Cloudinary/etc
                    // and get back a URL
                    const imageUrl =
                        `/placeholder.jpg?room=${room.id}&index=${index}`;

                    return {
                        url: imageUrl,
                        room_id: room.id,
                        is_primary: index === 0, // First image is primary
                    };
                }),
            );

            // Save image references in the database
            await prisma.roomImages.createMany({
                data: imageUrls,
            });
        }

        // Revalidate the paths to update the UI
        revalidatePath(`/owner/hostels/${hostel_id}`);
        revalidatePath(`/hostels/${hostel_id}`);

        return {
            success: true,
            room,
        };
    } catch (error) {
        console.error("Room creation error:", error);
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Failed to create room",
        };
    }
}
