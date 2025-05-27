"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building,
  Home,
  CreditCard,
  Calendar,
  Settings,
  LogOut,
  Plus,
  MapPin,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Hostel {
  id: string;
  name: string;
  location: string;
  university: string;
  verified: boolean;
  rooms: { count: number }[];
  bookings: { count: number }[];
}

interface Booking {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  hostel: {
    name: string;
  };
  room: {
    type: string;
    price: number;
  };
  check_in_date: string;
  check_out_date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "pending" | "partial" | "completed";
}

interface OwnerDashboardProps {
  hostels: Hostel[];
  recentBookings: Booking[];
}

export function OwnerDashboard({
  hostels,
  recentBookings,
}: OwnerDashboardProps) {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const totalRooms = hostels.reduce(
    (acc, hostel) => acc + (hostel.rooms[0]?.count || 0),
    0
  );
  const totalBookings = hostels.reduce(
    (acc, hostel) => acc + (hostel.bookings[0]?.count || 0),
    0
  );

  console.log(hostels);

  const handleDeleteHostel = (hostelId: string) => {
    // In a real app, this would be a server action to delete the hostel
    toast({
      title: "Hostel deleted",
      description: "The hostel has been successfully deleted",
    });
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Hallynk
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Switch to Student View
            </Button>

            <Avatar>
              <AvatarImage
                src="/placeholder.svg?height=40&width=40"
                alt="User"
              />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-background rounded-lg border p-4 sticky top-24">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage
                    src="/placeholder.svg?height=80&width=80"
                    alt="User"
                  />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-semibold text-lg">{user?.email}</h2>
                <p className="text-muted-foreground text-sm">Hostel Owner</p>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/owner/dashboard"
                  className="flex items-center gap-3 p-2 rounded-md bg-primary/10 text-primary font-medium"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/owner/hostels"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Building className="h-5 w-5" />
                  My Hostels
                </Link>
                <Link
                  href="/owner/bookings"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Calendar className="h-5 w-5" />
                  Bookings
                </Link>
                <Link
                  href="/owner/payments"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <CreditCard className="h-5 w-5" />
                  Payments
                </Link>
                <Link
                  href="/owner/settings"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h1 className="text-2xl font-bold mb-6">Hostel Owner Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Hostels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{hostels.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRooms}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Hostels</h2>
              <Button onClick={() => router.push("/owner/hostels/new")}>
                <Plus className="h-4 w-4 mr-2" /> Add New Hostel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {hostels.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 pb-6 text-center">
                    <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Hostels Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't added any hostels yet. Add your first hostel
                      to start receiving bookings.
                    </p>
                    <Button onClick={() => router.push("/owner/hostels/new")}>
                      <Plus className="h-4 w-4 mr-2" /> Add New Hostel
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                hostels.map((hostel) => (
                  <Card key={hostel.id} className="overflow-hidden">
                    <div className="flex flex-col">
                      <div className="relative h-40 w-full">
                        <Image
                          src={`/placeholder.svg?height=300&width=400&text=${encodeURIComponent(
                            hostel.name
                          )}`}
                          alt={hostel.name}
                          fill
                          className="object-cover"
                        />
                        {hostel.verified && (
                          <Badge
                            className="absolute top-2 right-2 bg-green-600"
                            variant="secondary"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{hostel.name}</h3>
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{hostel.location}</span>
                        </div>

                        <div className="flex gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Rooms:
                            </span>{" "}
                            <span className="font-medium">
                              {hostel.rooms[0]?.count || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Bookings:
                            </span>{" "}
                            <span className="font-medium">
                              {hostel.bookings[0]?.count || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              router.push(`/owner/hostels/${hostel.id}`)
                            }
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              router.push(`/owner/hostels/${hostel.id}/edit`)
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              router.push(
                                `/owner/hostels/${hostel.id}/rooms/new`
                              )
                            }
                          >
                            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                            Add Room
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>

              {recentBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      No Bookings Yet
                    </h3>
                    <p className="text-muted-foreground">
                      You haven't received any bookings yet. They will appear
                      here once students book your hostels.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {booking.user.first_name?.[0]}
                                  {booking.user.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {booking.user.first_name}{" "}
                                  {booking.user.last_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {booking.user.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 md:text-center">
                            <div className="text-sm text-muted-foreground">
                              Hostel
                            </div>
                            <div className="font-medium">
                              {booking.hostel.name}
                            </div>
                            <div className="text-sm">
                              {booking.room.type} - ₵{booking.room.price}
                            </div>
                          </div>

                          <div className="flex-1 md:text-center">
                            <div className="text-sm text-muted-foreground">
                              Check-in / Check-out
                            </div>
                            <div className="font-medium">
                              {new Date(
                                booking.check_in_date
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                booking.check_out_date
                              ).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex flex-col md:items-end gap-2">
                            <div className="flex gap-2">
                              <Badge
                                variant={
                                  booking.status === "confirmed"
                                    ? "default"
                                    : booking.status === "pending"
                                    ? "outline"
                                    : "destructive"
                                }
                              >
                                {booking.status.charAt(0).toUpperCase() +
                                  booking.status.slice(1)}
                              </Badge>
                              <Badge
                                variant={
                                  booking.payment_status === "completed"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {booking.payment_status === "completed"
                                  ? "Paid"
                                  : booking.payment_status === "partial"
                                  ? "Partial"
                                  : "Unpaid"}
                              </Badge>
                            </div>

                            {booking.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/owner/bookings")}
                    >
                      View All Bookings
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
