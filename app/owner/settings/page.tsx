import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { OwnerSettingsForm } from "@/components/owner/settings-form";

export default async function OwnerSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?redirect=/owner/settings");
  }

  if (session.user.role !== "OWNER") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    redirect("/auth/login?redirect=/owner/settings");
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <OwnerSettingsForm user={user} />
    </div>
  );
}
