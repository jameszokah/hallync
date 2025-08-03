import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Payment } from "@/components/payment/payment";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: (await params).id,
      user_id: session.user.id,
    },
    include: {
      room: {
        include: {
          hostel: true,
        },
      },
      user: true,
    },
  });

  if (!booking) {
    notFound();
  }

  return <Payment booking={booking as any} />;
}
