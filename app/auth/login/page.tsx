"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.696,44,30.342,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

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
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-200"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
              </Button>
            </motion.div>
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
