"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { HostelReviews } from "@/components/hostel-reviews"
import { BookingForm } from "@/components/booking-form"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

interface HostelDetailsProps {
  hostel: any
}

export function HostelDetails({ hostel }: HostelDetailsProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveHostel = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save hostels",
      })
      router.push(`/auth/login?redirect=/hostels/${hostel.id}`)
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      if (isSaved) {
        // Remove from saved hostels
        await supabase.from("saved_hostels").delete().eq("user_id", user.id).eq("hostel_id", hostel.id)

        setIsSaved(false)
        toast({
          title: "Hostel removed",
          description: "Hostel removed from your saved list",
        })
      } else {
        // Add to saved hostels
        await supabase.from("saved_hostels").insert({
          user_id: user.id,
          hostel_id: hostel.id,
        })

        setIsSaved(true)
        toast({
          title: "Hostel saved",
          description: "Hostel added to your saved list",
        })
      }
    } catch (error) {
      console.error("Error saving hostel:", error)
      toast({
        title: "Error",
        description: "Failed to save hostel. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if hostel is saved when component mounts
  useState(() => {
    const checkSavedStatus = async () => {
      if (!user) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from("saved_hostels")
        .select()
        .eq("user_id", user.id)
        .eq("hostel_id", hostel.id)
        .maybeSingle()

      if (!error && data) {
        setIsSaved(true)
      }
    }

    checkSavedStatus()
  })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/hostels" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-xl truncate">{hostel.name}</h1>
            <div className="ml-auto flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator
                    .share({
                      title: hostel.name,
                      text: `Check out ${hostel.name} on Hallynk`,
                      url: window.location.href,
                    })
                    .catch(() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast({
                        title: "Link copied",
                        description: "Hostel link copied to clipboard",
                      })
                    })
                }}
              >
                <Share className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSaveHostel} disabled={isLoading}>
                <Heart className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
                    <Image
                      src={hostel.images[0] || "/placeholder.svg"}
                      alt={hostel.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 h-80 md:h-96">
                    {hostel.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${hostel.name} - Image ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{hostel.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-1">({hostel.totalReviews} reviews)</span>
                  </div>
                  <Button variant="outline" size="sm">
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

                <p className="text-muted-foreground mb-6">{hostel.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {hostel.amenities &&
                    Object.entries(hostel.amenities)
                      .filter(([_, value]) => value === true)
                      .map(([key]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className="text-primary">
                            {key === "wifi" && <Wifi className="h-4 w-4" />}
                            {key === "security" && <Shield className="h-4 w-4" />}
                            {key === "water" && <Droplets className="h-4 w-4" />}
                            {key === "electricity" && <Zap className="h-4 w-4" />}
                            {key === "study_room" && <BookOpen className="h-4 w-4" />}
                          </div>
                          <span>{key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}</span>
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
                          <p className="text-muted-foreground">{hostel.distance_to_campus}</p>
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
                          <p className="text-muted-foreground">{hostel.availability || "Available for booking"}</p>
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
                          <h3 className="font-semibold mb-2">About the Owner</h3>
                          <p className="text-muted-foreground">
                            Managed by {hostel.owner.first_name} {hostel.owner.last_name}. Typically responds within 24
                            hours.
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
                        {hostel.rooms.map((room) => (
                          <div
                            key={room.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <h3 className="font-semibold text-lg">{room.type}</h3>
                              <p className="text-muted-foreground">
                                {room.available} {room.available === 1 ? "room" : "rooms"} available
                              </p>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                              <div className="font-bold text-xl">₵{room.price.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">per semester</div>
                              <Button
                                className="mt-2"
                                onClick={() => {
                                  document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })
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
                    reviews={hostel.reviews}
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
                    <CardDescription>Have questions? Reach out directly</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full flex justify-start gap-2">
                      <Phone className="h-4 w-4" />
                      Call Hostel
                    </Button>
                    <Button variant="outline" className="w-full flex justify-start gap-2">
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
  )
}
