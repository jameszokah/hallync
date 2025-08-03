"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { uploadHostelImages } from "../cloudflare";

interface RoomData {
    type: string;
    description: string;
    price: number;
    capacity: number;
    available: boolean;
    amenities: any;
    images?: File[];
    owner_id: string;
}

export async function getRoomById(roomId: string) {
    const room = await prisma.room.findUnique({
        where: {
            id: roomId,
        },
        include: {
            images: true,
        },
    });
    return room;
}

export async function updateRoomAction(roomId: string, data: RoomData) {
    try {
        let uploadedImageUrls: string[] = [];
        if (data.images && data.images.length > 0) {
            uploadedImageUrls = await uploadHostelImages(
                data.owner_id,
                data.images,
            );
        }

        const room = await prisma.room.update({
            where: {
                id: roomId,
            },
            data: {
                type: data.type,
                description: data.description,
                price: data.price,
                capacity: data.capacity,
                available: data.available,
                amenities: data.amenities,
                ...(uploadedImageUrls.length > 0 && {
                    images: {
                        create: uploadedImageUrls.map((url) => ({
                            url,
                            is_primary: false, // You might want to handle primary image selection differently
                        })),
                    },
                }),
            },
        });

        revalidatePath(`/owner/hostels/${room.hostel_id}/rooms/${room.id}`);
        revalidatePath(`/owner/hostels/${room.hostel_id}`);

        return {
            success: true,
            roomId: room.id,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "An error occurred while updating the room",
        };
    }
}
