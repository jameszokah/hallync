"use client"

import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">Hallynk</h1>
          </Link>
          <p className="text-muted-foreground mt-2">Find your perfect student hostel in Ghana</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />
            <div className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link
                href="#"
                className="text-primary hover:underline"
                onClick={() => document.querySelector('[data-value="register"]')?.click()}
              >
                Sign up
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm />
            <div className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link
                href="#"
                className="text-primary hover:underline"
                onClick={() => document.querySelector('[data-value="login"]')?.click()}
              >
                Login
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
