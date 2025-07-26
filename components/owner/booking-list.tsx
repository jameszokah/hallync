"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";

// This is a placeholder type. You might want to generate this from your Prisma schema
// or define it more accurately based on your data model.
type Booking = {
  id: string;
  user: {
    name: string | null;
    image: string | null;
  };
  hostel: {
    name: string;
  };
  room: {
    type: string;
  };
  check_in_date: string;
  status: "PENDING" | "CONFIRMED";
  payment_status: "PENDING" | "PARTIAL" | "COMPLETED";
  amount: number;
};

export function OwnerBookingList({ bookings }: { bookings: Booking[] }) {
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
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incoming Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length > 0 ? (
          <motion.div
            className="overflow-x-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Booking Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking, index) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={booking.user.image || undefined} />
                          <AvatarFallback>
                            {booking.user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{booking.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.hostel.name}</TableCell>
                    <TableCell>{booking.room.type}</TableCell>
                    <TableCell>
                      {new Date(booking.check_in_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "CONFIRMED"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.payment_status === "COMPLETED"
                            ? "default"
                            : booking.payment_status === "PARTIAL"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {booking.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      GHS {booking.amount.toFixed(2)}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No bookings yet</h3>
            <p className="text-muted-foreground">
              New bookings will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
