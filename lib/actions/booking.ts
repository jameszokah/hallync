'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createBooking(room: any, moveInDate: Date) {
  console.log(room, 'room')

  const booking = await prisma.booking.create({
    data: {
      user_id: "1",
      room_id: room.id,
      hostel_id: room.hostel_id,
      check_in_date: moveInDate,
      check_out_date: new Date(),
      amount: room.price,
      status: "PENDING",
      payment_status: "PENDING",
      payment_method: "MOBILE_MONEY",
    }
  })
    
    revalidatePath('/hostels/[id]')

  return booking
}