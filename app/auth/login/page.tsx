"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconBrandGoogle } from "@tabler/icons-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "";

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: redirectPath ? `/${redirectPath}` : "/",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">Hallynk</h1>
          </Link>
          <p className="text-muted-foreground mt-2">
            Find your perfect student hostel in Ghana
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-4 my-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <IconBrandGoogle className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </div>
          <div className="flex gap-4 items-center justify-center my-4 mx-auto w-full">
            <Separator className="w-1/3" />
            <p className="text-sm text-muted-foreground">Or</p>
            <Separator className="w-1/3" />
          </div>
          <TabsContent value="login">
            <Suspense>
              <LoginForm />
            </Suspense>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Don&apos;t have an account?{" "}
              <Link
                href="#"
                className="text-primary hover:underline"
                onClick={() =>
                  (
                    document.querySelector(
                      '[data-value="register"]'
                    ) as HTMLElement
                  )?.click()
                }
              >
                Sign up
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <Suspense>
              <RegisterForm />
            </Suspense>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link
                href="#"
                className="text-primary hover:underline"
                onClick={() =>
                  (
                    document.querySelector(
                      '[data-value="login"]'
                    ) as HTMLElement
                  )?.click()
                }
              >
                Login
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
