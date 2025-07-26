"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Share,
  Heart,
  MapPin,
  Wifi,
  Shield,
  Zap,
  Droplets,
  BookOpen,
  Phone,
  MessageSquare,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Footer } from "@/components/footer";
import { HostelReviews } from "@/components/hostel-reviews";
import { BookingForm } from "@/components/booking-form";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";    
import prisma from "@/lib/prisma";
import {
  HostelImages,
  Hostels as HostelType,
  HostelReviews as HostelReviewsType,
} from "@/app/generated/prisma";
import { saveHostel, unsaveHostel } from "@/lib/actions/hostel";
import { HostelImageGallery } from "./hostel-image-gallery";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// HostelDetailsProps interface should be defined here based on your data
// For brevity, it is omitted here, but it should match the 'hostel' object structure
interface HostelDetailsProps {
  hostel: {
    id: string;
    images: string[];
    name: string;
    description: string;
    location: string;
    rating: number;
    totalReviews: number;
    ratingDistribution: { [key: string]: number };
    verified: boolean;
    amenities: { [key: string]: boolean };
    distance_to_campus: string;
    // availability: string;
    owner: {
      first_name: string;
      last_name: string;
    };
    rooms: {
      id: string;
      type: string;
      available: number;
      price: number;
    }[];
    reviews: {
      id: string;
      rating: number;
      comment: string;
      user: {
        id: string;
        first_name: string;
        last_name: string;
      }[];
    }[];
  };
}

export function HostelDetails({ hostel }: HostelDetailsProps) {
  const router = useRouter();
  const { data: session } = useSession(); 
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleSaveHostel = async () => {
    if (!session) {
      toast.error("Authentication required", {
        description: "Please log in to save hostels",
      });
      router.push(`/auth/login?redirect=/hostels/${hostel.id}`);
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        await unsaveHostel(hostel.id, session?.user?.id);
        setIsSaved(false);
          toast.success("Hostel removed from your saved list");
      } else {
        await saveHostel(hostel.id, session?.user?.id);
        setIsSaved(true);
        toast.success("Hostel added to your saved list");
      }
    } catch (error) {
      toast.error("Failed to update saved status.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if hostel is saved when component mounts
  useState(() => {
    const checkSavedStatus = async () => {
      if (!session) return;

      const savedHostel = await saveHostel(hostel.id, session?.user?.id);

      if (savedHostel) {
        setIsSaved(true);
      }
    };

    checkSavedStatus();
  });

  const openPhotoGallery = (initialIndex = 0) => {
    setCurrentPhotoIndex(initialIndex);
    setShowPhotoGallery(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";
  };

  const closePhotoGallery = () => {
    setShowPhotoGallery(false);
    // Re-enable scrolling when modal is closed
    document.body.style.overflow = "auto";
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) =>
      prev === hostel.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? hostel.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Photo Gallery Modal */}
      {showPhotoGallery && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closePhotoGallery}
        >
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={closePhotoGallery}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center justify-center w-full h-full px-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevPhoto}
              className="absolute left-4 md:left-8 text-white hover:bg-white/20 rounded-full"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <div className="relative h-[80vh] w-full max-w-4xl">
              <Image
                src={hostel?.images?.[currentPhotoIndex] || "/placeholder.svg"}
                alt={`${hostel.name} - Photo ${currentPhotoIndex + 1}`}
                fill
                className="object-contain"
              />
              <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                {currentPhotoIndex + 1} / {hostel.images.length}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextPhoto}
              className="absolute right-4 md:right-8 text-white hover:bg-white/20 rounded-full"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </div>
      )}

      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/hostels" className="mr-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <h1 className="font-bold text-base md:text-xl truncate">
                {hostel.name}
              </h1>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{hostel.location}</span>
              </div>
            </div>
            <div className="ml-auto flex gap-1 md:gap-2">
              {hostel.verified && (
                <Badge
                  className="hidden md:flex bg-green-600 items-center gap-1 h-7"
                  variant="secondary"
                >
                  <Shield className="h-3 w-3" /> Verified
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator
                    .share({
                      title: hostel.name,
                      text: `Check out ${hostel.name} on Hallynk`,
                      url: window.location.href,
                    })
                    .catch(() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Hostel link copied to clipboard");
                    });
                }}
                className="rounded-full hover:bg-primary/10 transition-colors"
              >
                <Share className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveHostel}
                disabled={isLoading}
                className="rounded-full hover:bg-primary/10 transition-colors"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isSaved ? "fill-red-500 text-red-500" : ""
                  } transition-colors duration-300`}
                />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div
                    className="relative h-80 md:h-[28rem] col-span-2 rounded-xl overflow-hidden shadow-md group cursor-pointer"
                    onClick={() => openPhotoGallery(0)}
                  >
                    <Image
                      src={hostel?.images?.[0] || "/placeholder.svg"}
                      alt={hostel.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 h-80 md:h-[28rem]">
                    {hostel?.images?.slice(1, 3).map((image, index) => (
                      <div
                        key={index}
                        className="relative rounded-xl overflow-hidden shadow-md group cursor-pointer"
                        onClick={() => openPhotoGallery(index + 1)}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${hostel.name} - Image ${index + 2}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium text-sm">
                      {hostel.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({hostel.totalReviews} reviews)
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-sm px-4 hover:bg-primary/10"
                    onClick={() => openPhotoGallery(0)}
                  >
                    View All Photos
                  </Button>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{hostel.name}</h2>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{hostel.location}</span>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    {hostel.verified && (
                      <Badge className="bg-green-600" variant="secondary">
                        <Shield className="h-3 w-3 mr-1" /> Verified Hostel
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  {hostel.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {hostel.amenities &&
                    Object.entries(hostel.amenities)
                      .filter(([_, value]) => value === true)
                      .map(([key]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className="text-primary">
                            {key === "wifi" && <Wifi className="h-4 w-4" />}
                            {key === "security" && (
                              <Shield className="h-4 w-4" />
                            )}
                            {key === "water" && (
                              <Droplets className="h-4 w-4" />
                            )}
                            {key === "electricity" && (
                              <Zap className="h-4 w-4" />
                            )}
                            {key === "study_room" && (
                              <BookOpen className="h-4 w-4" />
                            )}
                          </div>
                          <span>
                            {key.charAt(0).toUpperCase() +
                              key.slice(1).replace("_", " ")}
                          </span>
                        </div>
                      ))}
                </div>
              </div>

              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="rooms">Room Types</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Location</h3>
                          <p className="text-muted-foreground">
                            {hostel.distance_to_campus} km from campus
                          </p>
                          <div className="mt-2 h-48 bg-muted rounded-md relative">
                            <Image
                              src="/placeholder.svg?height=300&width=600&text=Map"
                              alt="Map location"
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Availability</h3>
                          <p className="text-muted-foreground">
                            Available for booking
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Hostel Rules</h3>
                          <ul className="text-muted-foreground space-y-1">
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              Visitors allowed from 8am to 8pm
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              No cooking in rooms
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              Quiet hours from 10pm to 6am
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              ID card required for entry
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">
                            About the Owner
                          </h3>
                          <p className="text-muted-foreground">
                            Managed by {hostel.owner.first_name}{" "}
                            {hostel.owner.last_name}. Typically responds within
                            24 hours.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="rooms" className="pt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {hostel?.rooms?.map((room) => (
                          <div
                            key={room.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <h3 className="font-semibold text-lg">
                                {room.type}
                              </h3>
                              <p className="text-muted-foreground">
                                {room.available}{" "}
                                {room.available === 1 ? "room" : "rooms"}{" "}
                                available
                              </p>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                              <div className="font-bold text-xl">
                                ₵{room.price.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                per semester
                              </div>
                              <Button
                                className="mt-2"
                                onClick={() => {
                                  document
                                    .getElementById("booking-form")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                              >
                                Select
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="reviews" className="pt-4">
                  <HostelReviews
                    hostelId={hostel.id}
                    reviews={hostel?.reviews || []}
                    ratingStats={{
                      average: hostel.rating,
                      total: hostel.totalReviews,
                      distribution: hostel.ratingDistribution,
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24" id="booking-form">
                <BookingForm hostel={hostel} />

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Contact Hostel</CardTitle>
                    <CardDescription>
                      Have questions? Reach out directly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full flex justify-start gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call Hostel
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex justify-start gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message Hostel
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
