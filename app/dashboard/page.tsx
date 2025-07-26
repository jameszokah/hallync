import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Booking, BookingStatus, PaymentStatus } from "@/app/generated/prisma";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Bookmark,
  Building2,
  Calendar as CalendarIcon,
  CheckCircle,
  CreditCard,
  Phone,
  Mail,
  User,
  Home,
  Star,
} from "lucide-react";

// Define custom badge variants
import { cn } from "@/lib/utils";
import { badgeVariants } from "@/components/ui/badge";
import { BookingCalendar, BookingDate } from "@/components/ui/booking-calendar";
import LogoutButton from "@/components/logout-button";

// Helper component for success badge variant
const SuccessBadge = ({ children }: { children: React.ReactNode }) => (
  <span
    className={cn(
      badgeVariants({ variant: "outline" }),
      "bg-green-50 text-green-700 border-green-200"
    )}
  >
    {children}
  </span>
);

// Helper function to get dates with bookings
const getBookingDates = (bookings: Booking[]) => {
  const dates: BookingDate[] = [];
  bookings.forEach((booking) => {
    // Create a new date object for the check-in date
    const checkInDate = new Date(booking.check_in_date);

    // Create a new date object for the check-out date
    const checkOutDate = new Date(booking.check_out_date);

    // Add both dates to the array
    dates.push({
      date: checkInDate,
      type: "check-in",
      bookingId: booking.id,
    });

    dates.push({
      date: checkOutDate,
      type: "check-out",
      bookingId: booking.id,
    });
  });

  return dates;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date: string; tab: string }>;
}) {
  const session = await auth();

  const { date, tab } = await searchParams;

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch user data with bookings and saved hostels
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bookings: {
        include: {
          room: {
            include: {
              hostel: true,
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      saved_hostels: {
        include: {
          hostel: {
            include: {
              images: {
                where: { is_primary: true },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Get active bookings (pending or confirmed)
  const activeBookings = user.bookings.filter(
    (booking) =>
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.CONFIRMED
  );

  // Get booking history (completed bookings)
  const bookingHistory = user.bookings.filter(
    (booking) =>
      booking.status === BookingStatus.CONFIRMED &&
      booking.payment_status === PaymentStatus.COMPLETED
  );

  // Get saved hostels
  const savedHostels = user.saved_hostels;

  // Get all booking dates for calendar highlights
  const bookingDates = getBookingDates([...activeBookings, ...bookingHistory]);

  // Get recommended hostels
  // 1. Start with hostels at the same university as the user (if any previous bookings)
  // 2. Add popular hostels
  // 3. Add hostels near previously booked locations
  const userUniversities = user.bookings
    .map((booking) => booking.room?.hostel?.university)
    .filter(Boolean);
  const userLocations = user.bookings
    .map((booking) => booking.room?.hostel?.location)
    .filter(Boolean);

  let recommendedHostels = await prisma.hostels.findMany({
    where: {
      OR: [
        // University match (if user has any bookings that indicate a university)
        ...(userUniversities.length > 0
          ? [{ university: { in: userUniversities } }]
          : []),
        // Location match
        ...(userLocations.length > 0
          ? [{ location: { in: userLocations } }]
          : []),
        // Featured hostels as fallback
        { featured: true },
      ],
      // Don't show hostels the user has already booked
      NOT: {
        id: {
          in: user.bookings
            .map((booking) => booking.room?.hostel?.id)
            .filter(Boolean),
        },
      },
      verified: true, // Only verified hostels
    },
    include: {
      images: {
        where: { is_primary: true },
        take: 1,
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    take: 3, // Limit to 3 recommendations
  });

  // If we don't have enough recommendations, add some featured hostels
  if (recommendedHostels.length < 3) {
    const featuredHostels = await prisma.hostels.findMany({
      where: {
        featured: true,
        verified: true,
        NOT: {
          id: {
            in: [
              ...recommendedHostels.map((h) => h.id),
              ...user.bookings.map((b) => b.room?.hostel?.id).filter(Boolean),
            ],
          },
        },
      },
      include: {
        images: {
          where: { is_primary: true },
          take: 1,
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      take: 3 - recommendedHostels.length,
    });

    recommendedHostels = [...recommendedHostels, ...featuredHostels];
  }

  // Calculate average ratings
  recommendedHostels = recommendedHostels.map((hostel) => {
    const ratings = hostel.reviews.map((review) => review.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null;
    return {
      ...hostel,
      avgRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {user.first_name || user.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your hostel bookings and preferences
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/hostels">
            <Button
              variant="outline"
              className="hidden md:flex gap-2 items-center"
            >
              <Building2 size={16} /> Browse Hostels
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column - User info and stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage
                    src={user.image || "/placeholder-user.jpg"}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback>
                    {user.first_name?.[0]}
                    {user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg">{user.name}</h3>
                <Badge variant="secondary" className="mt-1">
                  {user.role}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-muted-foreground" />
                  <span>
                    {user.first_name} {user.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-2">
                    <Home size={16} className="text-muted-foreground" />
                    <span>{user.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t bg-muted/20 py-3">
              <Button variant="ghost" size="sm">
                Edit Profile
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>At a Glance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Building2 size={20} className="text-primary" />
                  </div>
                  <span>Active Bookings</span>
                </div>
                <Badge variant="outline">{activeBookings.length}</Badge>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <span>Booking History</span>
                </div>
                <Badge variant="outline">{bookingHistory.length}</Badge>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Bookmark size={20} className="text-primary" />
                  </div>
                  <span>Saved Hostels</span>
                </div>
                <Badge variant="outline">{savedHostels.length}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Track your bookings</CardDescription>
            </CardHeader>
            <CardContent className="px-2 py-0">
              <BookingCalendar
                bookingDates={bookingDates}
                // initialDate={date ? new Date(date) : bookingDates[0]?.date}
                // onDateSelect={(date) => {
                //   redirect(
                //     `/dashboard?date=${date?.toISOString()}&tab=${
                //       tab || "active-bookings"
                //     }`
                //   );
                // }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Bookings and saved hostels */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue={tab || "active-bookings"} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger
                value="active-bookings"
                // onClick={() => redirect(`/dashboard?tab=active-bookings`)}
              >
                Active Bookings
              </TabsTrigger>
              <TabsTrigger
                value="saved-hostels"
                // onClick={() => redirect(`/dashboard?tab=saved-hostels`)}
              >
                Saved Hostels
              </TabsTrigger>
              <TabsTrigger
                value="history"
                // onClick={() => redirect(`/dashboard?tab=history`)}
              >
                Booking History
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="active-bookings"
              className="animate-in fade-in-50 duration-300"
            >
              {activeBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="aspect-video relative">
                        <Image
                          src={
                            booking.room.images?.[0]?.url || "/placeholder.jpg"
                          }
                          alt={booking.room.hostel.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          {booking.status === BookingStatus.CONFIRMED ? (
                            <SuccessBadge>Confirmed</SuccessBadge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {booking.room.hostel.name}
                          </CardTitle>
                          {booking.payment_status ===
                          PaymentStatus.COMPLETED ? (
                            <SuccessBadge>Paid</SuccessBadge>
                          ) : (
                            <Badge variant="outline">
                              {booking.payment_status}
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          {booking.room.hostel.location} • {booking.room.type}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon size={14} />
                            <span>Check in:</span>
                          </div>
                          <span className="font-medium">
                            {format(new Date(booking.check_in_date), "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon size={14} />
                            <span>Check out:</span>
                          </div>
                          <span className="font-medium">
                            {format(new Date(booking.check_out_date), "PPP")}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div className="font-medium">GHS {booking.amount}</div>
                        <Link href={`/bookings/${booking.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="bg-muted rounded-full p-3 mb-4">
                      <Building2 size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      No Active Bookings
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center">
                      You don't have any active hostel bookings at the moment.
                    </p>
                    <Link href="/hostels">
                      <Button>Browse Hostels</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent
              value="saved-hostels"
              className="animate-in fade-in-50 duration-300"
            >
              {savedHostels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedHostels.map((saved) => (
                    <Card
                      key={saved.id}
                      className="overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="aspect-video relative">
                        <Image
                          src={
                            saved.hostel.images?.[0]?.url || "/placeholder.jpg"
                          }
                          alt={saved.hostel.name}
                          fill
                          className="object-cover"
                        />
                        <button className="absolute top-2 right-2 bg-background rounded-full p-1.5 shadow-sm">
                          <Bookmark
                            size={16}
                            className="text-primary"
                            fill="currentColor"
                          />
                        </button>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {saved.hostel.name}
                        </CardTitle>
                        <CardDescription>
                          {saved.hostel.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm pb-2">
                        <p className="line-clamp-2">
                          {saved.hostel.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-end border-t pt-4">
                        <Link href={`/hostels/${saved.hostel.id}`}>
                          <Button size="sm">View Hostel</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="bg-muted rounded-full p-3 mb-4">
                      <Bookmark size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      No Saved Hostels
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center">
                      You haven't saved any hostels to your favorites yet.
                    </p>
                    <Link href="/hostels">
                      <Button>Browse Hostels</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent
              value="history"
              className="animate-in fade-in-50 duration-300"
            >
              {bookingHistory.length > 0 ? (
                <div className="space-y-4">
                  {bookingHistory.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-48 h-32">
                          <Image
                            src={
                              booking.room.images?.[0]?.url ||
                              "/placeholder.jpg"
                            }
                            alt={booking.room.hostel.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex flex-col sm:flex-row justify-between mb-2">
                            <h3 className="font-medium">
                              {booking.room.hostel.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <CheckCircle
                                size={14}
                                className="text-green-500"
                              />
                              <span>Completed</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {booking.room.hostel.location} • {booking.room.type}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-3">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={14} />
                              <span>
                                {format(new Date(booking.check_in_date), "PP")}{" "}
                                -{" "}
                                {format(new Date(booking.check_out_date), "PP")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard size={14} />
                              <span>GHS {booking.amount}</span>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Link href={`/hostels/${booking.room.hostel.id}`}>
                              <Button variant="outline" size="sm">
                                Book Again
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="bg-muted rounded-full p-3 mb-4">
                      <Clock size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      No Booking History
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center">
                      You haven't completed any bookings yet.
                    </p>
                    <Link href="/hostels">
                      <Button>Browse Hostels</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Recommended For You</CardTitle>
              <CardDescription>
                {userUniversities.length > 0
                  ? `Based on your university and booking history`
                  : `Featured hostels you might like`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedHostels.map((hostel) => (
                  <Link
                    key={hostel.id}
                    href={`/hostels/${hostel.id}`}
                    className="block"
                  >
                    <div className="rounded-lg overflow-hidden border group hover:shadow-md transition-all duration-200 h-full">
                      <div className="aspect-video relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                        <Image
                          src={hostel.images?.[0]?.url || "/placeholder.jpg"}
                          alt={hostel.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-2 left-2 right-2 z-20">
                          <h4 className="text-white font-medium truncate">
                            {hostel.name}
                          </h4>
                          <p className="text-white/80 text-xs truncate">
                            {hostel.location}
                          </p>
                        </div>
                        {hostel.reviews.length > 0 && (
                          <div className="absolute top-2 right-2 z-20 bg-white/90 rounded-full py-0.5 px-2 flex items-center gap-1">
                            <Star
                              size={12}
                              className="text-yellow-500 fill-yellow-500"
                            />
                            <span className="text-xs font-medium">
                              {hostel.reviews.reduce(
                                (sum, review) => sum + review.rating,
                                0
                              ) / hostel.reviews.length}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            View details
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {hostel.university}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Link href="/hostels">
                <Button variant="outline">View All Hostels</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
