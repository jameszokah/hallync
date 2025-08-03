import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import BookingDetailsClient from "./booking-details-client";

export default async function BookingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      hostel: true,
      room: true,
    },
  });

  if (!booking) {
    notFound();
  }

  return <BookingDetailsClient booking={booking} />;
}
