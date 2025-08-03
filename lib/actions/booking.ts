"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

interface BookingData {
  roomId: string;
  hostelId: string;
  moveInDate: Date;
  moveOutDate: Date;
  amount: number;
}

export async function createBooking(data: BookingData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const booking = await prisma.booking.create({
    data: {
      user_id: session.user.id,
      room_id: data.roomId,
      hostel_id: data.hostelId,
      check_in_date: data.moveInDate,
      check_out_date: data.moveOutDate,
      amount: data.amount,
      status: "PENDING",
      payment_status: "PENDING",
      payment_method: "CARD", // Defaulting to card for Paystack
    },
  });

  revalidatePath(`/hostels/${data.hostelId}`);
  revalidatePath("/bookings");

  return booking;
}
