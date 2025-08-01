'use client'

import { Button } from "./ui/button";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return <Button onClick={() => signOut()}>Logout</Button>;
}