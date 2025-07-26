"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Building,
  MapPin,
  Bed,
  Users,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Hostel {
  id: string;
  name: string;
  location: string;
  verified: boolean;
  images: { url: string }[];
  rooms: { id: string }[];
  _count: {
    bookings: number;
  };
}

interface OwnerHostelListProps {
  hostels: Hostel[];
}

export function OwnerHostelList({ hostels }: OwnerHostelListProps) {
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

  if (hostels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
        >
          <Building
            className="h-24 w-24 text-primary/20 mb-6"
            strokeWidth={1}
          />
        </motion.div>
        <motion.h2
          className="text-2xl font-semibold mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          No Hostels Found
        </motion.h2>
        <motion.p
          className="text-muted-foreground mb-6 max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          It looks like you haven't added any hostels yet. Get started by
          listing your first property.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/owner/hostels/new">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Hostel
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Hostels</h1>
        <Link href="/owner/hostels/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Hostel
          </Button>
        </Link>
      </div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {hostels.map((hostel) => (
          <motion.div key={hostel.id} variants={itemVariants}>
            <Card className="overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-xl hover:border-primary/20">
              <CardHeader className="p-0 relative">
                <Carousel className="w-full">
                  <CarouselContent>
                    {hostel.images.length > 0 ? (
                      hostel.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-video relative">
                            <Image
                              src={image.url}
                              alt={hostel.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem>
                        <div className="aspect-video relative bg-muted flex items-center justify-center">
                          <Building className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  {hostel.images.length > 1 && (
                    <>
                      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                    </>
                  )}
                </Carousel>
                <div className="absolute top-4 right-4 z-10">
                  <Badge
                    variant={hostel.verified ? "default" : "secondary"}
                    className={cn(
                      "text-xs font-semibold",
                      hostel.verified
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"
                    )}
                  >
                    {hostel.verified ? (
                      <CheckCircle className="h-3 w-3 mr-1.5" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1.5" />
                    )}
                    {hostel.verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-grow">
                <CardTitle className="text-xl font-bold mb-2 truncate group-hover:text-primary">
                  {hostel.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm flex items-center mb-4">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{hostel.location}</span>
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Bed className="h-4 w-4 mr-2 text-primary/70" />
                    <span>{hostel.rooms.length} Rooms</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2 text-primary/70" />
                    <span>{hostel._count.bookings} Bookings</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between items-center">
                <Link href={`/owner/hostels/${hostel.id}`}>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/owner/hostels/${hostel.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Hostel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
