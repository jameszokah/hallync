import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { OwnerBookingList } from "@/components/owner/booking-list";

export default async function OwnerBookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?redirect=/owner/bookings");
  }

  if (session.user.role !== "OWNER") {
    redirect("/");
  }

  const ownerHostels = await prisma.hostels.findMany({
    where: {
      owner_id: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  const hostelIds = ownerHostels.map((hostel) => hostel.id);

  const bookings = await prisma.booking.findMany({
    where: {
      hostel_id: {
        in: hostelIds,
      },
      deletedAt: null,
    },
    include: {
      user: true,
      room: true,
      hostel: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Your Bookings</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <OwnerBookingList bookings={bookings as any} />
      </Suspense>
    </div>
  );
}
