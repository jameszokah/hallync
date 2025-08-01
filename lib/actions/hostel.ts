"use server"

import { revalidatePath } from "next/cache"
import prisma from "../prisma"

interface HostelData {
  name: string
  description: string
  location: string
  university: string
  distance_to_campus: string
  owner_id: string
  amenities: {
    wifi: boolean
    security: boolean
    water: boolean
    electricity: boolean
    study_room: boolean
    air_conditioning: boolean
    kitchen: boolean
    laundry: boolean
  }
  images: File[]
}

interface RoomData {
  hostel_id: string
  type: string
  price: number
  capacity: number
  available: number
  amenities: {
    wifi?: boolean
    security?: boolean
    water?: boolean
    electricity?: boolean
    study_room?: boolean
  }
  
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


export async function saveHostel(hostelId: string, userId: string) {
  
  const savedHostel = await prisma.savedHostels.findFirst({
    where: {
      user_id: userId,
      hostel_id: hostelId,
    },
  });

  revalidatePath("/hostels")

  return savedHostel
  
  
}


export async function unsaveHostel(hostelId: string, userId: string) {
  const savedHostel = await prisma.savedHostels.deleteMany({
    where: {
      user_id: userId,
      hostel_id: hostelId
    }
  });

  revalidatePath("/hostels")

  return savedHostel.count;
}

export const createHostelAction = async (data: HostelData) => {
  
  try {
    const hostel = await prisma.hostels.create({
    data: {
      name: data.name,
      description: data.description,
      location: data.location,
      university: data.university,
      owner_id: data.owner_id,
      amenities: data.amenities,
      verified: false,
      distance_to_campus: data.distance_to_campus,
      images: {
        create: data.images.map((image) => ({
          url: image.name,
          is_primary: false,
        })),
      },
    }
  })

  revalidatePath("/owner/hostels")

  return {
    success: true,
    hostelId: hostel.id,
  }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while creating the hostel",
    }
  }
}