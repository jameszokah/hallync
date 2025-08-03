"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { uploadHostelImages } from "../cloudflare";

interface HostelData {
  name: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  university: string;
  distance_to_campus: string;
  owner_id: string;
  amenities: {
    wifi: boolean;
    security: boolean;
    water: boolean;
    electricity: boolean;
    study_room: boolean;
    air_conditioning: boolean;
    kitchen: boolean;
    laundry: boolean;
  };
  images: File[];
}

interface RoomData {
  hostel_id: string;
  type: string;
  price: number;
  capacity: number;
  available: number;
  amenities: {
    wifi?: boolean;
    security?: boolean;
    water?: boolean;
    electricity?: boolean;
    study_room?: boolean;
  };
}

// export async function createHostel(data: HostelData) {
//   const supabase = await createClient()

//   try {
//     // Insert the hostel
//     const { data: hostel, error } = await supabase
//       .from("hostels")
//       .insert({
//         name: data.name,
//         description: data.description,
//         location: data.location,
//         university: data.university,
//         distance_to_campus: data.distance_to_campus,
//         owner_id: data.owner_id,
//         verified: false, // New hostels start as unverified
//         amenities: data.amenities,
//       })
//       .select()
//       .single()

//     if (error) throw error

//     // Upload images if any
//     if (data.images.length > 0) {
//       for (let i = 0; i < data.images.length; i++) {
//         const file = data.images[i]
//         const fileExt = file.name.split(".").pop()
//         const fileName = `${hostel.id}/${Date.now()}-${i}.${fileExt}`
//         const filePath = `hostels/${fileName}`

//         // Upload the image to Supabase Storage
//         const { error: uploadError } = await supabase.storage.from("hostel-images").upload(filePath, file)

//         if (uploadError) throw uploadError

//         // Get the public URL
//         const { data: publicUrl } = supabase.storage.from("hostel-images").getPublicUrl(filePath)

//         // Insert the image record
//         const { error: imageError } = await supabase.from("hostel_images").insert({
//           hostel_id: hostel.id,
//           url: publicUrl.publicUrl,
//           is_primary: i === 0, // First image is primary
//         })

//         if (imageError) throw imageError
//       }
//     }

//     revalidatePath("/owner/dashboard")
//     revalidatePath("/owner/hostels")

//     return {
//       success: true,
//       hostelId: hostel.id,
//     }
//   } catch (error: any) {
//     console.error("Error creating hostel:", error)
//     return {
//       success: false,
//       error: error.message,
//     }
//   }
// }

// export async function createRoom(data: RoomData) {
//   const supabase = await createClient()

//   try {
//     const { data: room, error } = await supabase.from("rooms").insert(data).select().single()

//     if (error) throw error

//     return {
//       success: true,
//       roomId: room.id,
//     }
//   } catch (error: any) {
//   }
// }

export async function getSavedHostelStatus(hostelId: string, userId: string) {
  if (!userId) return null;
  return prisma.savedHostels.findFirst({
    where: {
      user_id: userId,
      hostel_id: hostelId,
    },
  });
}

export async function saveHostel(hostelId: string, userId: string) {
  if (!userId) {
    throw new Error("Authentication required to save a hostel.");
  }

  const existing = await prisma.savedHostels.findFirst({
    where: { user_id: userId, hostel_id: hostelId },
  });

  if (existing) {
    return existing;
  }

  const newSavedHostel = await prisma.savedHostels.create({
    data: {
      user_id: userId,
      hostel_id: hostelId,
    },
  });

  revalidatePath("/hostels");
  revalidatePath(`/hostels/${hostelId}`);

  return newSavedHostel;
}

export async function unsaveHostel(hostelId: string, userId: string) {
  if (!userId) {
    throw new Error("Authentication required to unsave a hostel.");
  }
  const result = await prisma.savedHostels.deleteMany({
    where: {
      user_id: userId,
      hostel_id: hostelId,
    },
  });

  revalidatePath("/hostels");
  revalidatePath(`/hostels/${hostelId}`);

  return { success: result.count > 0 };
}

export async function getHostelById(hostelId: string) {
  const hostel = await prisma.hostels.findUnique({
    where: {
      id: hostelId,
    },
    include: {
      images: true,
    },
  });
  return hostel;
}

export const createHostelAction = async (data: HostelData) => {
  try {
    const images = await uploadHostelImages(data.owner_id, data.images);
    const hostel = await prisma.hostels.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        university: data.university,
        owner_id: data.owner_id,
        amenities: data.amenities,
        verified: false,
        distance_to_campus: data.distance_to_campus,
        images: {
          create: images.map((image, index) => ({
            url: image,
            is_primary: index === 0,
          })),
        },
      },
    });

    revalidatePath("/owner/hostels");

    return {
      success: true,
      hostelId: hostel.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while creating the hostel",
    };
  }
};

export const updateHostelAction = async (
  hostelId: string,
  data: HostelData,
) => {
  try {
    let uploadedImageUrls: string[] = [];
    if (data.images.length > 0) {
      uploadedImageUrls = await uploadHostelImages(data.owner_id, data.images);
    }

    const hostel = await prisma.hostels.update({
      where: {
        id: hostelId,
      },
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        university: data.university,
        distance_to_campus: data.distance_to_campus,
        amenities: data.amenities,
        ...(uploadedImageUrls.length > 0 && {
          images: {
            create: uploadedImageUrls.map((url, index) => ({
              url,
              is_primary: index === 0,
            })),
          },
        }),
      },
    });

    revalidatePath(`/owner/hostels/${hostelId}`);
    revalidatePath("/owner/hostels");

    return {
      success: true,
      hostelId: hostel.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while updating the hostel",
    };
  }
};
