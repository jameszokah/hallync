'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const UpdateProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
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

  const { name, phone } = validatedFields.data;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
      },
    });

    revalidatePath('/owner/settings');

    return { success: 'Profile updated successfully!' };
  } catch (error) {
    return { error: 'Something went wrong.' };
  }
} 