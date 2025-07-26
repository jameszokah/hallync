import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Building,
  Calendar,
  CreditCard,
  Settings,
  BarChart,
  Menu,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/auth/login");
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/owner/dashboard",
      icon: Home,
    },
    {
      name: "My Hostels",
      href: "/owner/hostels",
      icon: Building,
    },
    {
      name: "Bookings",
      href: "/owner/bookings",
      icon: Calendar,
    },
    {
      name: "Payments",
      href: "/owner/payments",
      icon: CreditCard,
      disabled: true,
    },
    {
      name: "Analytics",
      href: "/owner/analytics",
      icon: BarChart,
      disabled: true,
    },
    {
      name: "Settings",
      href: "/owner/settings",
      icon: Settings,
    },
  ];

  const initials = session.user.name 
    ? `${session.user.name.charAt(0)}` 
    : session.user.first_name && session.user.last_name 
      ? `${session.user.first_name.charAt(0)}${session.user.last_name.charAt(0)}` 
      : session.user.email?.charAt(0) || "U";

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster position="top-center" />
      
      {/* Header - Mobile and Desktop */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <Link href="/" className="flex items-center gap-2 mt-6 mb-8 px-2">
                  <div className="font-bold text-xl">
                    <Image src="/logo.svg" alt="Hallynk" width={100} height={100} className="w-14 h-14" />
                  </div>
                </Link>
                <div className="flex flex-col gap-6 px-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 text-sm font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="font-bold text-xl flex items-center gap-2">
              Hallynk
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hidden md:block">
              View Main Site
            </Link>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user.image || ""}
                alt={session.user.name || "User"}
              />
              <AvatarFallback>
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 pt-16 bg-white border-r">
          <div className="flex flex-col flex-grow px-4 py-6">
            <div className="mb-6">
              <div className="flex items-center px-3 py-2 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={session.user.image || ""}
                    alt={session.user.name || "User"}
                  />
                  <AvatarFallback>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {session.user.name || session.user.first_name && session.user.last_name 
                      ? `${session.user.first_name} ${session.user.last_name}` 
                      : session.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">Hostel Owner</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const isActive = item.href === "/owner/dashboard"; // Update this based on current route
                if (item.disabled) {
                  return (
                    <div key={item.name} className="flex items-center px-3 py-2 rounded-md gap-3 text-sm transition-colors text-muted-foreground/60 cursor-not-allowed">
                      <item.icon className={`h-5 w-5 text-muted-foreground`} />
                      <span>{item.name} (Coming Soon)</span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md gap-3 text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{item.name}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
                  </Link>
                );
              })}
            </nav>

            <form action="/api/auth/signout" method="post" className="mt-auto">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" type="submit">
                <LogOut className="h-5 w-5 mr-3" />
                Sign out
              </Button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 