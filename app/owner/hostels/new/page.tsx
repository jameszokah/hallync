import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { NewHostelForm } from "@/components/owner/new-hostel-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Hostel - Hallynk",
  description: "Create a new student hostel listing on Hallynk platform",
};

export default async function NewHostelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "OWNER") {
    redirect("/");
  }

  // Fetch universities for the dropdown
  const universities = await prisma.university.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <NewHostelForm universities={universities} userId={session.user.id} />
    </div>
  );
}
