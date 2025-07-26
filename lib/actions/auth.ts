"use server";
import { signIn } from "@/auth";
import prisma from "../prisma";
import { UserRole } from "@/app/generated/prisma";
import bcrypt from "bcryptjs";

export async function registerAction(
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  phone: string,
  role: string,
) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
        phone,
        role: role as UserRole,
      },
    });

    // After successful registration, sign the user in
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });

    return { success: true };
  } catch (error: any) {
    if (error.type === "CredentialsSignin") {
      return {
        success: false,
        error: "Invalid credentials after registration.",
      };
    }
    // Handle potential redirect errors from signIn
    if (error.message.includes("NEXT_REDIRECT")) {
      return { success: true };
    }
    return {
      success: false,
      error: error.message || "An unexpected error occurred.",
    };
  }
}

export async function signInAction(
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  phone: string,
  role: string,
) {
  try {
    console.log(
      email,
      password,
      first_name,
      last_name,
      phone,
      role,
      "email, password, first_name, last_name, phone, role",
    );

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
      // redirect: false,
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        first_name,
        last_name,
        phone,
        // university,
        role: role as UserRole,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Invalid credentials" };
  }
}

export async function getUser(id: string | undefined) {
  if (!id) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user;
}
