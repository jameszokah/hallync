import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { OwnerDashboard } from "@/components/owner/dashboard";
import { Prisma } from "@/app/generated/prisma";

export default async function OwnerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "OWNER") {
    redirect("/");
  }

  // Fetch the owner's hostels with room count
  const hostels = await prisma.hostels.findMany({
    where: {
      owner_id: session.user.id,
      deletedAt: null,
    },
    include: {
      rooms: {
        where: {
          deletedAt: null,
        },
      },
      images: {
        where: {
          is_primary: true,
        },
        take: 1,
      },
    },
  });

  // Get all room IDs to fetch bookings
  const roomIds = hostels.flatMap((hostel) =>
    hostel.rooms.map((room) => room.id)
  );

  // Fetch recent bookings for all hostels
  const recentBookings = await prisma.booking.findMany({
    where: {
      room_id: {
        in: roomIds,
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
      room: {
        select: {
          id: true,
          type: true,
          price: true,
          hostel: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  // Calculate total rooms and bookings
  const totalRooms = hostels.reduce(
    (total, hostel) => total + hostel.rooms.length,
    0
  );

  // Get booking stats
  const bookingStats = await prisma.booking.groupBy({
    by: ["status", "payment_status"],
    where: {
      room_id: {
        in: roomIds,
      },
      deletedAt: null,
    },
    _count: {
      id: true,
    },
  });

  // Calculate total revenue from completed bookings
  const revenueData = await prisma.booking.aggregate({
    where: {
      room_id: {
        in: roomIds,
      },
      payment_status: "COMPLETED",
      deletedAt: null,
    },
    _sum: {
      amount: true,
    },
  });

  const totalRevenue = revenueData._sum.amount || 0;

  // Get monthly booking stats for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  let monthlyBookings: { month: Date; count: bigint }[] = [];

  // if (roomIds.length > 0) {
  //   monthlyBookings = (await prisma.$queryRaw`
  //     SELECT 
  //       DATE_TRUNC('month', "check_in_date") as month,
  //       COUNT(*) as count
  //     FROM "Booking"
  //     WHERE
  //       "room_id"::text IN (${Prisma.join(roomIds)})
  //       AND "deletedAt" IS NULL
  //       AND "check_in_date" >= ${sixMonthsAgo}
  //     GROUP BY DATE_TRUNC('month', "check_in_date")
  //     ORDER BY month ASC
  //   `) as { month: Date; count: bigint }[];
  // }

  // Format data for the dashboard
  const formattedMonthlyBookings = monthlyBookings.map((item) => ({
    month: item.month.toISOString().split("T")[0].slice(0, 7), // Format as YYYY-MM
    count: Number(item.count),
  }));


  return (
    <OwnerDashboard
      hostels={hostels}
      recentBookings={recentBookings}
      totalRooms={totalRooms}
      bookingStats={bookingStats}
      totalRevenue={totalRevenue}
      monthlyBookings={formattedMonthlyBookings}
      user={session.user}
    />
  );
}
