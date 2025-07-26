"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Building,
  MapPin,
  School,
  Edit,
  Trash2,
  Plus,
  Users,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Wifi,
  Home,
  ImageIcon,
  MoreHorizontal,
  ExternalLink,
  Copy,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { Booking } from "@/app/generated/prisma";

interface RoomImage {
  id: string;
  url: string;
  is_primary: boolean;
}

interface Room {
  id: string;
  type: string;
  price: number;
  capacity: number;
  description: string | null;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  hostel_id: string;
  images: RoomImage[];
}

interface HostelImage {
  id: string;
  url: string;
  is_primary: boolean;
  hostel_id: string;
}

interface Hostel {
  id: string;
  name: string;
  description: string;
  university: string;
  location: string;
  owner_id: string;
  verified: boolean;
  featured: boolean;
  distance_to_campus: string | null;
  amenities: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  images: HostelImage[];
  rooms: Room[];
  owner: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
}

interface BookingUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  image: string | null;
}

interface IBooking extends Booking {
  id: string;
  user_id: string;
  room_id: string;
  hostel_id: string;
  check_in_date: Date;
  check_out_date: Date;
  status: string;
  payment_status: string;
  payment_method: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: BookingUser;
  room: Room;
}

interface BookingStat {
  status: string;
  payment_status: string;
  _count: {
    id: number;
  };
}

interface HostelDetailPageProps {
  hostel: Hostel;
  bookings: IBooking[];
  bookingStats: BookingStat[];
  universityName: string;
}

export function HostelDetailPage({
  hostel,
  bookings,
  bookingStats,
  universityName,
}: HostelDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate booking statistics
  const pendingBookings =
    bookingStats.find((stat) => stat.status === "PENDING")?._count.id || 0;

  const confirmedBookings =
    bookingStats.find((stat) => stat.status === "CONFIRMED")?._count.id || 0;

  const totalBookings = pendingBookings + confirmedBookings;

  const pendingPayments =
    bookingStats.find((stat) => stat.payment_status === "PENDING")?._count.id ||
    0;

  const completedPayments =
    bookingStats.find((stat) => stat.payment_status === "COMPLETED")?._count
      .id || 0;

  // Calculate occupancy rate
  const totalRoomCapacity = hostel.rooms.reduce(
    (acc, room) => acc + room.capacity,
    0
  );
  const bookedCapacity = confirmedBookings; // Simplification; in a real app this would be more complex
  const occupancyRate =
    totalRoomCapacity > 0
      ? Math.min(Math.round((bookedCapacity / totalRoomCapacity) * 100), 100)
      : 0;

  const handleDeleteHostel = () => {
    // This would be a server action in a real app
    setPendingAction("delete-hostel");
    setTimeout(() => {
      toast({
        title: "Hostel deleted",
        description: "The hostel has been successfully deleted",
      });
      setIsDeleteDialogOpen(false);
      setPendingAction(null);
      router.push("/owner/dashboard");
    }, 1500);
  };

  const handleDeleteRoom = (roomId: string) => {
    // This would be a server action in a real app
    setPendingAction(`delete-room-${roomId}`);
    setTimeout(() => {
      toast({
        title: "Room deleted",
        description: "The room has been successfully deleted",
      });
      setPendingAction(null);
    }, 1500);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getInitials = (user: BookingUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : "U";
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PARTIAL":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: message,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="space-y-6">
      {/* Hostel Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {hostel.name}
            {hostel.verified && (
              <Badge variant="secondary" className="bg-green-600 text-white">
                Verified
              </Badge>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground mt-1">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{hostel.location}</span>
            </div>
            <div className="flex items-center">
              <School className="h-4 w-4 mr-1" />
              <span>{universityName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/owner/hostels/${hostel.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" /> Edit Hostel
          </Button>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to delete this hostel?
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  this hostel and all associated rooms and bookings.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={pendingAction === "delete-hostel"}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteHostel}
                  disabled={pendingAction === "delete-hostel"}
                >
                  {pendingAction === "delete-hostel" ? (
                    <>Deleting...</>
                  ) : (
                    <>Delete Hostel</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => router.push(`/hostels/${hostel.id}`)}
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Preview
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Left Column - Hostel Details */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-2 space-y-6"
            >
              {/* Hostel Images Carousel */}
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Hostel Photos</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        router.push(`/owner/hostels/${hostel.id}/photos`)
                      }
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Manage Photos
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {hostel.images.length > 0 ? (
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {hostel.images.map((image, index) => (
                            <CarouselItem key={image.id}>
                              <div className="relative aspect-video">
                                <Image
                                  src={image.url || "/placeholder.jpg"}
                                  alt={`${hostel.name} - Image ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted/40 flex flex-col items-center justify-center rounded-lg border">
                      <ImageIcon className="h-10 w-10 text-muted-foreground opacity-40" />
                      <p className="text-muted-foreground mt-2">
                        No images available
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() =>
                          router.push(`/owner/hostels/${hostel.id}/photos`)
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Photos
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hostel Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{hostel.description}</p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {hostel.amenities &&
                      Object.entries(hostel.amenities).map(([key, value]) =>
                        value ? (
                          <div key={key} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                          </div>
                        ) : null
                      )}
                    {(!hostel.amenities ||
                      Object.values(hostel.amenities).filter(Boolean).length ===
                        0) && (
                      <div className="col-span-full text-muted-foreground">
                        No amenities listed
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Bookings</CardTitle>
                    <CardDescription>
                      Recent reservation requests for this hostel
                    </CardDescription>
                  </div>

                  <Link href={`/owner/bookings?hostel=${hostel.id}`}>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={booking.user.image || ""} />
                              <AvatarFallback>
                                {getInitials(booking.user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {booking.user.first_name}{" "}
                                {booking.user.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.room.type} Room
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(booking.check_in_date)} to{" "}
                                {formatDate(booking.check_out_date)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={getBookingStatusColor(booking.status)}
                            >
                              {booking.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getPaymentStatusColor(
                                booking.payment_status
                              )}
                            >
                              {booking.payment_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="mx-auto h-10 w-10 opacity-30 mb-2" />
                      <p>No bookings yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Stats and Actions */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    onClick={() =>
                      router.push(`/owner/hostels/${hostel.id}/rooms/new`)
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add New Room
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      router.push(`/owner/hostels/${hostel.id}/edit`)
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit Hostel Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      copyToClipboard(
                        `${window.location.origin}/hostels/${hostel.id}`,
                        "Hostel link copied to clipboard"
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copy Hostel Link
                  </Button>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Rooms
                      </span>
                      <span className="font-medium">{hostel.rooms.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Bookings
                      </span>
                      <span className="font-medium">{totalBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Pending Bookings
                      </span>
                      <span className="font-medium">{pendingBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Completed Payments
                      </span>
                      <span className="font-medium">{completedPayments}</span>
                    </div>
                  </div>

                  {/* Occupancy Rate */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Occupancy Rate
                      </span>
                      <span className="font-medium">{occupancyRate}%</span>
                    </div>
                    <Progress value={occupancyRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{hostel.location}</span>
                  </div>
                  <div className="flex items-center">
                    <School className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{universityName}</span>
                  </div>
                  {hostel.distance_to_campus && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{hostel.distance_to_campus} to campus</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Rooms ({hostel.rooms.length})
              </h2>
              <Button
                onClick={() =>
                  router.push(`/owner/hostels/${hostel.id}/rooms/new`)
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Room
              </Button>
            </div>

            {hostel.rooms.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Home className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-3" />
                  <h3 className="text-lg font-medium mb-2">No rooms yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Start adding rooms to your hostel so students can book them.
                    Add details like room type, capacity, and amenities.
                  </p>
                  <Button
                    onClick={() =>
                      router.push(`/owner/hostels/${hostel.id}/rooms/new`)
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add First Room
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {hostel.rooms.map((room) => (
                  <motion.div key={room.id} variants={itemVariants}>
                    <Card className="h-full flex flex-col overflow-hidden">
                      <div className="relative h-40">
                        {room.images.length > 0 ? (
                          <Image
                            src={room.images[0].url}
                            alt={room.type}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-muted/60 flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-muted-foreground opacity-40" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/owner/hostels/${hostel.id}/rooms/${room.id}/edit`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" /> Edit Room
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteRoom(room.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Room
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <CardContent className="pt-4 flex-grow flex flex-col">
                        <div className="mb-3">
                          <h3 className="font-semibold text-lg">{room.type}</h3>
                          <div className="flex items-center text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            <span>
                              {room.capacity}{" "}
                              {room.capacity > 1 ? "persons" : "person"}
                            </span>
                          </div>
                        </div>

                        {room.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {room.description}
                          </p>
                        )}

                        <div className="mt-auto">
                          <div className="text-2xl font-bold">
                            {formatPrice(room.price)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            per semester/year
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0 pb-4">
                        <div className="w-full flex gap-2">
                          <Button
                            variant="default"
                            className="flex-1"
                            onClick={() =>
                              router.push(
                                `/owner/hostels/${hostel.id}/rooms/${room.id}`
                              )
                            }
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-grow-0"
                            onClick={() =>
                              router.push(
                                `/owner/hostels/${hostel.id}/rooms/${room.id}/edit`
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Bookings</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" /> View Calendar
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                {bookings.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-3 text-left">Student</th>
                            <th className="px-4 py-3 text-left">Room</th>
                            <th className="px-4 py-3 text-left">Dates</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((booking) => (
                            <tr
                              key={booking.id}
                              className="border-t hover:bg-muted/40"
                            >
                              <td className="px-4 py-3">
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <div className="flex items-center gap-3 cursor-pointer">
                                      <Avatar className="h-7 w-7">
                                        <AvatarImage
                                          src={booking.user.image || ""}
                                        />
                                        <AvatarFallback>
                                          {getInitials(booking.user)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="font-medium">
                                        {booking.user.first_name}{" "}
                                        {booking.user.last_name}
                                      </div>
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-64">
                                    <div className="flex justify-between space-x-4">
                                      <Avatar>
                                        <AvatarImage
                                          src={booking.user.image || ""}
                                        />
                                        <AvatarFallback>
                                          {getInitials(booking.user)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">
                                          {booking.user.first_name}{" "}
                                          {booking.user.last_name}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                          {booking.user.email}
                                        </p>
                                        <div className="flex items-center pt-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() =>
                                              copyToClipboard(
                                                booking.user.email || "",
                                                "Email copied to clipboard"
                                              )
                                            }
                                          >
                                            <Copy className="h-3 w-3 mr-1" />{" "}
                                            Copy Email
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium">
                                  {booking.room.type}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatPrice(booking.amount)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-xs">
                                  <div>
                                    From: {formatDate(booking.check_in_date)}
                                  </div>
                                  <div>
                                    To: {formatDate(booking.check_out_date)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {formatPrice(booking.amount)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    variant="outline"
                                    className={getBookingStatusColor(
                                      booking.status
                                    )}
                                  >
                                    {booking.status}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={getPaymentStatusColor(
                                      booking.payment_status
                                    )}
                                  >
                                    {booking.payment_status}
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem>
                                      <CheckCircle className="h-4 w-4 mr-2" />{" "}
                                      Confirm Booking
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <AlertCircle className="h-4 w-4 mr-2" />{" "}
                                      Cancel Booking
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Users className="h-4 w-4 mr-2" /> Contact
                                      Student
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <h3 className="text-lg font-medium mb-2">
                      No Bookings Yet
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                      You don't have any bookings yet. Once students start
                      booking your rooms, they will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
