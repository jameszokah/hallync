"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  DollarSign,
  Home,
  Calendar,
  Settings,
  Plus,
  MapPin,
  Check,
  X,
  CreditCard,
  TrendingUp,
  Users,
  User,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { motion } from "framer-motion";

interface HostelImage {
  id: string;
  url: string;
  is_primary: boolean;
}

interface Room {
  id: string;
  type: string;
  price: number;
  capacity: number;
  available: boolean;
}

interface Hostel {
  id: string;
  name: string;
  location: string;
  university: string;
  verified: boolean;
  description: string;
  distance_to_campus?: string | null;
  rooms: Room[];
  images: HostelImage[];
}

interface BookingUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
    email: string;
  image: string | null;
}

interface BookingRoom {
  id: string;
  type: string;
  price: number;
  hostel: {
    id: string;
    name: string;
  };
}

interface Booking {
  id: string;
  user: BookingUser;
  room: BookingRoom;
  check_in_date: string | Date;
  check_out_date: string | Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  payment_status: "PENDING" | "PARTIAL" | "COMPLETED";
  amount: number;
  createdAt: string | Date;
}

interface BookingStat {
  status: string;
  payment_status: string;
  _count: {
    id: number;
  };
}

interface MonthlyBooking {
  month: string;
  count: number;
}

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

interface OwnerDashboardProps {
  hostels: Hostel[];
  recentBookings: Booking[];
  totalRooms: number;
  bookingStats: BookingStat[];
  totalRevenue: number;
  monthlyBookings: MonthlyBooking[];
  user: User;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function OwnerDashboard({
  hostels,
  recentBookings,
  totalRooms,
  bookingStats,
  totalRevenue,
  monthlyBookings,
  user,
}: OwnerDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate booking statistics
  const pendingBookings =
    bookingStats.find((stat) => stat.status === "PENDING")?._count.id || 0;
  const confirmedBookings =
    bookingStats.find((stat) => stat.status === "CONFIRMED")?._count.id || 0;
  const totalBookings = pendingBookings + confirmedBookings;

  // Calculate hostel occupancy rate
  const occupancyRate =
    hostels.length > 0 && totalRooms > 0
      ? (
          (bookingStats.reduce((acc, stat) => acc + stat._count.id, 0) /
            totalRooms) *
          100
        ).toFixed(1)
      : 0;

  // Prepare data for the pie chart
  const bookingStatusData = [
    { name: "Pending", value: pendingBookings },
    { name: "Confirmed", value: confirmedBookings },
  ].filter((item) => item.value > 0);

  // Format monthly booking data
  const chartData = monthlyBookings.map((item) => ({
    name: new Date(item.month).toLocaleString("default", { month: "short" }),
    bookings: item.count,
  }));

  const handleDeleteHostel = (hostelId: string) => {
    // In a real app, this would be a server action to delete the hostel
    toast.success("Hostel deleted successfully");
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (user: BookingUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <Button onClick={() => router.push("/owner/hostels/new")}>
          <Plus className="h-4 w-4 mr-2" /> Add New Hostel
            </Button>
              </div>

      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hostels">Hostels</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Hostels
                  </CardTitle>
                  <Building className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{hostels.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across multiple locations
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Rooms
                  </CardTitle>
                  <Home className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRooms}</div>
                  <p className="text-xs text-muted-foreground">
                    Available for booking
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Bookings
                  </CardTitle>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <div className="text-xs text-muted-foreground">
                    {pendingBookings} pending, {confirmedBookings} confirmed
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From completed bookings
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Bookings</CardTitle>
                <CardDescription>
                  Booking trends over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="bookings"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
                <CardDescription>
                  Distribution of booking statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px] flex items-center justify-center">
                  {bookingStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {bookingStatusData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No booking data available
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>
            </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Your latest booking requests and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
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
                            {booking.user.first_name} {booking.user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.room.hostel.name} - {booking.room.type}
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
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="mx-auto h-10 w-10 opacity-30 mb-2" />
                    <p>No recent bookings found</p>
                  </div>
                )}
              </div>
              {recentBookings.length > 0 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/owner/bookings")}
                  >
                    View All Bookings
              </Button>
            </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hostels" className="space-y-6">
          <div className="flex flex-col gap-6">
              {hostels.length === 0 ? (
              <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Hostels Yet</h3>
                    <p className="text-muted-foreground mb-4">
                    You haven't added any hostels yet. Add your first hostel to
                    start receiving bookings.
                    </p>
                    <Button onClick={() => router.push("/owner/hostels/new")}>
                      <Plus className="h-4 w-4 mr-2" /> Add New Hostel
                    </Button>
                  </CardContent>
                </Card>
              ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {hostels.map((hostel) => (
                  <motion.div key={hostel.id} variants={itemVariants}>
                    <Card className="overflow-hidden h-full flex flex-col">
                      <div className="relative h-40 w-full">
                        <Image
                          src={hostel.images[0]?.url || "/placeholder.jpg"}
                          alt={hostel.name}
                          fill
                          className="object-cover"
                        />
                        {hostel.verified && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-600 hover:bg-green-700">
                              <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="pt-6 flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {hostel.name}
                        </h3>
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {hostel.location}
                        </div>
                        <p className="text-sm line-clamp-2 mb-4">
                          {hostel.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-2 bg-muted/60 rounded-md">
                            <div className="text-xs text-muted-foreground">
                              Rooms
                            </div>
                            <div className="font-semibold">
                              {hostel.rooms.length}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-muted/60 rounded-md">
                            <div className="text-xs text-muted-foreground">
                              Available
                            </div>
                            <div className="font-semibold">
                              {
                                hostel.rooms.filter((room) => room.available)
                                  .length
                              }
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      <div className="px-6 pb-6 pt-0 mt-auto flex gap-2">
                          <Button
                          variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              router.push(`/owner/hostels/${hostel.id}`)
                            }
                          >
                          <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/owner/hostels/${hostel.id}/edit`)
                            }
                          >
                          <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                          variant="outline"
                            size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteHostel(hostel.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                <motion.div variants={itemVariants}>
                  <Card className="border-dashed h-full flex flex-col justify-center items-center p-6">
                    <div className="text-center">
                      <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">
                        Add New Hostel
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Add another hostel to expand your portfolio
                      </p>
                      <Button onClick={() => router.push("/owner/hostels/new")}>
                        <Plus className="h-4 w-4 mr-2" /> Add Hostel
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
              )}
            </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
                <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                Manage all your hostel bookings in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-3 text-left">Student</th>
                            <th className="px-4 py-3 text-left">
                              Hostel & Room
                            </th>
                            <th className="px-4 py-3 text-left">Dates</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                  {recentBookings.map((booking) => (
                            <tr
                              key={booking.id}
                              className="border-t hover:bg-muted/30"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={booking.user.image || ""}
                                    />
                                <AvatarFallback>
                                      {getInitials(booking.user)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                    <div className="font-medium">
                                  {booking.user.first_name}{" "}
                                  {booking.user.last_name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                  {booking.user.email}
                              </div>
                            </div>
                          </div>
                              </td>
                              <td className="px-4 py-3">
                            <div className="font-medium">
                                  {booking.room.hostel.name}
                            </div>
                                <div className="text-xs text-muted-foreground">
                                  {booking.room.type} -{" "}
                                  {formatCurrency(booking.room.price)}
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
                                {formatCurrency(booking.amount)}
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
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-56 p-2">
                                    <div className="flex flex-col gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start"
                                      >
                                        <Check className="h-4 w-4 mr-2" />{" "}
                                        Confirm Booking
                                      </Button>
                                <Button
                                        variant="ghost"
                                  size="sm"
                                        className="justify-start"
                                >
                                        <X className="h-4 w-4 mr-2" /> Cancel
                                        Booking
                                </Button>
                                <Button
                                        variant="ghost"
                                  size="sm"
                                        className="justify-start"
                                >
                                        <User className="h-4 w-4 mr-2" />{" "}
                                        Contact Student
                                </Button>
                              </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                          </div>
                        </div>

                  <div className="flex justify-center">
                    <Button variant="outline" className="text-primary">
                      View All Bookings
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                    You don't have any bookings yet. Once students start booking
                    your hostels, they will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

