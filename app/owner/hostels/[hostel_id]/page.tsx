import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import { HostelDetailPage } from "@/components/owner/hostel-detail";
import { Booking } from "@/app/generated/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { hostel_id: string };
}): Promise<Metadata> {
  const hostel = await prisma.hostels.findUnique({
    where: {
      id: params.hostel_id,
      deletedAt: null,
    },
    select: {
      name: true,
    },
  });

  if (!hostel) {
    return {
      title: "Hostel Not Found",
    };
  }

  return {
    title: `${hostel.name} - Hostel Management | Hallynk`,
    description: `Manage ${hostel.name} hostel details, rooms, and bookings`,
  };
}

export default async function HostelPage({
  params,
}: {
  params: { hostel_id: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "OWNER") {
    redirect("/");
  }

  // Fetch the hostel details with rooms and images
  const hostel = await prisma.hostels.findUnique({
    where: {
      id: params.hostel_id,
      owner_id: session.user.id,
      deletedAt: null,
    },
    include: {
      images: {
        orderBy: {
          is_primary: "desc",
        },
      },
      rooms: {
        where: {
          deletedAt: null,
        },
        include: {
          images: {
            orderBy: {
              is_primary: "desc",
            },
            take: 1,
          },
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!hostel) {
    notFound();
  }

  // Get room IDs to fetch bookings
  const roomIds = hostel.rooms.map((room) => room.id);

  // Fetch recent bookings for this hostel
  const recentBookings = await prisma.booking.findMany({
    where: {
      room_id: {
        in: roomIds.length > 0 ? roomIds : [""],
      },
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          image: true,
        },
      },
      room: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  // Get booking stats
  const bookingStats = await prisma.booking.groupBy({
    by: ["status", "payment_status"],
    where: {
      room_id: {
        in: roomIds.length > 0 ? roomIds : [""],
      },
      deletedAt: null,
    },
    _count: {
      id: true,
    },
  });

  // Get university name
  const university = await prisma.university.findUnique({
    where: {
      id: hostel.university,
    },
    select: {
      name: true,
    },
  });

  return (
    <HostelDetailPage
      hostel={hostel}
      bookings={recentBookings as any}
      bookingStats={bookingStats}
      universityName={university?.name || "Unknown"}
    />
  );
}
