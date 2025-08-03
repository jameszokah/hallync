"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(
  bookingId: string,
  paymentReference: string,
  status: "CONFIRMED" | "CANCELLED",
  paymentStatus: "COMPLETED" | "FAILED",
) {
  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        payment_status: paymentStatus,
        // You might want to store the payment reference for future reference
        // payment_reference: paymentReference,
      },
    });

    revalidatePath(`/booking/${bookingId}`);

    return {
      success: true,
      booking: updatedBooking,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ||
        "An error occurred while updating the booking status.",
    };
  }
}
