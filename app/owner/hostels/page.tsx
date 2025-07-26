import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { OwnerHostelList } from "@/components/owner/owner-hostel-list";
import { Suspense } from "react";

export default async function OwnerHostelsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?redirect=owner/hostels");
  }

  if (session.user.role !== "OWNER") {
    redirect("/");
  }

  const hostels = await prisma.hostels.findMany({
    where: {
      owner_id: session.user.id,
      deletedAt: null,
    },
    include: {
      images: true,
      rooms: {
        where: {
          deletedAt: null,
        },
      },
      _count: {
        select: {
          bookings: {
            where: {
              status: "CONFIRMED",
              deletedAt: null,
            },
          },
          
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <OwnerHostelList hostels={hostels as any} />
    </div>
  );
}
