"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  Home,
  BedDouble,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { Booking } from "@/app/generated/prisma";

type BookingWithDetails = Prisma.$BookingPayload<{
  include: {
    user: true;
    hostel: true;
    room: true;
  };
}>;

interface BookingDetailsClientProps {
  booking: BookingWithDetails;
}

const statusColors: { [key: string]: string } = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  PARTIAL: "bg-orange-100 text-orange-800",
};

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-background p-6 rounded-lg shadow-sm border"
  >
    <div className="flex items-center gap-4 mb-4">
      <Icon className="w-6 h-6 text-primary" />
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    <Separator />
    <div className="mt-4 space-y-4">{children}</div>
  </motion.div>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
    <p className="text-muted-foreground mb-1 sm:mb-0">{label}</p>
    <p className="font-medium text-left sm:text-right">{value}</p>
  </div>
);

export default function BookingDetailsClient({
  booking,
}: BookingDetailsClientProps) {
  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              Booking Details
            </h1>
            <Badge
              variant="outline"
              className="mt-2 sm:mt-0 text-lg font-mono"
            >
              {booking.id.substring(0, 8)}...
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Section icon={Home} title="Hostel & Room">
              <InfoRow label="Hostel" value={booking.hostel.name} />
              <InfoRow label="Location" value={booking.hostel.location} />
              <Separator />
              <InfoRow label="Room Type" value={booking.room.type} />
              <InfoRow
                label="Description"
                value={booking.room.description || "N/A"}
              />
            </Section>

            <Section icon={Calendar} title="Booking Information">
              <InfoRow
                label="Check-in Date"
                value={format(new Date(booking.check_in_date), "PPP")}
              />
              <InfoRow
                label="Check-out Date"
                value={format(new Date(booking.check_out_date), "PPP")}
              />
              <InfoRow
                label="Status"
                value={
                  <Badge className={`${statusColors[booking.status]}`}>
                    {booking.status}
                  </Badge>
                }
              />
            </Section>

            <Section icon={DollarSign} title="Payment Details">
              <InfoRow
                label="Amount"
                value={`GHS ${(booking.amount / 100).toFixed(2)}`}
              />
              <InfoRow
                label="Payment Status"
                value={
                  <Badge className={`${statusColors[booking.payment_status]}`}>
                    {booking.payment_status}
                  </Badge>
                }
              />
              <InfoRow
                label="Method"
                value={booking.payment_method.replace("_", " ")}
              />
            </Section>
          </div>

          <div className="space-y-8">
            <Section icon={User} title="Student Details">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarImage src={booking.user.image || undefined} />
                  <AvatarFallback>
                    {booking.user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg">{booking.user.name}</p>
                  <p className="text-sm text-muted-foreground">Student</p>
                </div>
              </div>
              <Separator />
              <InfoRow label="Email" value={booking.user.email} />
              <InfoRow label="Phone" value={booking.user.phone || "N/A"} />
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
} 