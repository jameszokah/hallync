"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateUserRole } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Home, User } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "OWNER" | "">(
    ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a role to continue.");
      return;
    }
    if (!session?.user?.id) {
      toast.error("User session not found. Please try logging in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateUserRole(session.user.id, selectedRole);
      if (result.success) {
        // This is crucial to update the session on the client-side
        await update({ role: selectedRole });

        toast.success("Welcome! Your role has been set.");

        // Hard redirect to force middleware to re-evaluate
        window.location.href = "/";
      } else {
        throw new Error(result.error || "Failed to update role.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Hallynk!</CardTitle>
          <CardDescription>
            To get started, please tell us who you are.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <RadioGroup
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as "STUDENT" | "OWNER")
              }
            >
              <Label
                htmlFor="student"
                className={`flex items-center space-x-4 rounded-md border p-4 transition-all cursor-pointer ${
                  selectedRole === "STUDENT"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="STUDENT" id="student" />
                <div className="flex items-center gap-4">
                  <User className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">I am a Student</p>
                    <p className="text-sm text-muted-foreground">
                      Browse and book hostels near your campus.
                    </p>
                  </div>
                </div>
              </Label>
              <Label
                htmlFor="owner"
                className={`flex items-center space-x-4 rounded-md border p-4 transition-all cursor-pointer ${
                  selectedRole === "OWNER"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="OWNER" id="owner" />
                <div className="flex items-center gap-4">
                  <Home className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">I am a Hostel Owner</p>
                    <p className="text-sm text-muted-foreground">
                      List your property and manage your bookings.
                    </p>
                  </div>
                </div>
              </Label>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !selectedRole}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
