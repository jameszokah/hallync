'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UserRole } from "@/app/generated/prisma";

const UpdateProfileSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  phone: z.string().optional(),
});

export async function updateUserProfile(values: z.infer<typeof UpdateProfileSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  const validatedFields = UpdateProfileSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields.' };
  }

  const { first_name, last_name, phone } = validatedFields.data;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        first_name,
        last_name,
        phone,
      },
    });

    revalidatePath('/owner/settings');

    return { success: 'Profile updated successfully!' };
  } catch (error) {
    return { error: 'Something went wrong.' };
  }
}

export async function updateUserRole(userId: string, role: "STUDENT" | "OWNER") {
  try {
    if (!userId || !role) {
      throw new Error("User ID and role are required.");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
    });

    return { success: true, user: updatedUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
} 