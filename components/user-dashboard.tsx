"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Bell,
  Home,
  Heart,
  CreditCard,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Star,
  MapPin,
  Calendar,
  ChevronRight,
  Eye,
  Building,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { formatDistanceToNow } from "date-fns"

interface Hostel {
  id: string
  name: string
  location: string
  university: string
  rating: number
  reviews: number
}

interface Booking {
  id: string
  status: string
  check_in_date: string
  check_out_date: string
  hostel: {
    id: string
    name: string
    location: string
  }
  room: {
    type: string
    price: number
  }
}

interface RecentlyViewedHostel extends Hostel {
  viewed_at: string
}

interface UserDashboardProps {
  user: any
  activeBookings: Booking[]
  savedHostels: Hostel[]
  recentlyViewed: RecentlyViewedHostel[]
  recommendedHostels: Hostel[]
  unreadCount: number
}

export function UserDashboard({
  user,
  activeBookings,
  savedHostels,
  recentlyViewed,
  recommendedHostels,
  unreadCount,
}: UserDashboardProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Hallynk
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center translate-x-1/3 -translate-y-1/3">
                  {unreadCount}
                </span>
              )}
            </Button>

            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user?.first_name || "User"} />
              <AvatarFallback>
                {user?.first_name ? user.first_name[0] : user?.email?.[0]?.toUpperCase() || "U"}
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
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt={user?.first_name || "User"} />
                  <AvatarFallback>
                    {user?.first_name ? user.first_name[0] : user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-semibold text-lg">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : "Welcome"}
                </h2>
                <p className="text-muted-foreground text-sm">{user?.university || user?.email}</p>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 p-2 rounded-md bg-primary/10 text-primary font-medium"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/bookings"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Calendar className="h-5 w-5" />
                  My Bookings
                </Link>
                <Link
                  href="/dashboard/favorites"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Heart className="h-5 w-5" />
                  Favorites
                </Link>
                <Link
                  href="/dashboard/payments"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <CreditCard className="h-5 w-5" />
                  Payments
                </Link>
                <Link
                  href="/dashboard/messages"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <MessageSquare className="h-5 w-5" />
                  Messages
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
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
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeBookings.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Saved Hostels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{savedHostels.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Unread Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{unreadCount}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="bookings" className="mb-8">
              <TabsList>
                <TabsTrigger value="bookings">Current Bookings</TabsTrigger>
                <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="mt-6">
                {activeBookings.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Active Bookings</h3>
                      <p className="text-muted-foreground mb-4">You don't have any active bookings at the moment.</p>
                      <Button onClick={() => router.push("/hostels")}>Find a Hostel</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Current Booking</CardTitle>
                      <CardDescription>Manage your active hostel booking</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative h-40 md:h-auto md:w-1/3 rounded-md overflow-hidden">
                          <Image
                            src="/placeholder.svg?height=200&width=300"
                            alt={activeBookings[0].hostel.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="md:w-2/3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{activeBookings[0].hostel.name}</h3>
                              <div className="flex items-center text-muted-foreground text-sm mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{activeBookings[0].hostel.location}</span>
                              </div>
                            </div>
                            <Badge>
                              {activeBookings[0].status.charAt(0).toUpperCase() + activeBookings[0].status.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Room Type</div>
                              <div>{activeBookings[0].room.type}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Price</div>
                              <div>₵{activeBookings[0].room.price.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Check-in Date</div>
                              <div>
                                {new Date(activeBookings[0].check_in_date).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Check-out Date</div>
                              <div>
                                {new Date(activeBookings[0].check_out_date).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => router.push(`/bookings/${activeBookings[0].id}`)}>
                        View Details
                      </Button>
                      <Button onClick={() => router.push(`/hostels/${activeBookings[0].hostel.id}`)}>
                        Contact Hostel
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="recent" className="mt-6">
                {recentlyViewed.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Recently Viewed Hostels</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't viewed any hostels recently. Start exploring!
                      </p>
                      <Button onClick={() => router.push("/hostels")}>Browse Hostels</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentlyViewed.map((hostel) => (
                      <Card key={hostel.id} className="overflow-hidden">
                        <div className="flex">
                          <div className="relative h-32 w-32 flex-shrink-0">
                            <Image
                              src={`/placeholder.svg?height=150&width=150&text=${encodeURIComponent(hostel.name)}`}
                              alt={hostel.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4 flex-1">
                            <h3 className="font-semibold">{hostel.name}</h3>
                            <div className="flex items-center text-muted-foreground text-sm mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{hostel.location}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="text-xs font-medium">{hostel.rating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground ml-1">({hostel.reviews})</span>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Viewed {formatDistanceToNow(new Date(hostel.viewed_at), { addSuffix: true })}
                            </div>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-sm mt-1"
                              onClick={() => router.push(`/hostels/${hostel.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommended" className="mt-6">
                {recommendedHostels.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center">
                      <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        We'll recommend hostels based on your preferences and university.
                      </p>
                      <Button onClick={() => router.push("/hostels")}>Browse All Hostels</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedHostels.map((hostel) => (
                      <Card key={hostel.id} className="overflow-hidden">
                        <div className="flex">
                          <div className="relative h-32 w-32 flex-shrink-0">
                            <Image
                              src={`/placeholder.svg?height=150&width=150&text=${encodeURIComponent(hostel.name)}`}
                              alt={hostel.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4 flex-1">
                            <h3 className="font-semibold">{hostel.name}</h3>
                            <div className="flex items-center text-muted-foreground text-sm mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{hostel.location}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="text-xs font-medium">{hostel.rating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground ml-1">({hostel.reviews})</span>
                            </div>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-sm mt-2"
                              onClick={() => router.push(`/hostels/${hostel.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Stay updated with your booking status and messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This would be fetched from a notifications table in a real app */}
                  {[
                    {
                      id: 1,
                      title: "Booking Confirmed",
                      description:
                        activeBookings.length > 0
                          ? `Your booking at ${activeBookings[0].hostel.name} has been confirmed.`
                          : "Your recent booking has been confirmed.",
                      time: "2 days ago",
                      type: "booking",
                    },
                    {
                      id: 2,
                      title: "New Message",
                      description: "You have a new message from hostel management.",
                      time: "3 days ago",
                      type: "message",
                    },
                    {
                      id: 3,
                      title: "Payment Reminder",
                      description:
                        activeBookings.length > 0
                          ? `Your final payment for ${activeBookings[0].hostel.name} is due in 7 days.`
                          : "Your upcoming payment is due soon.",
                      time: "5 days ago",
                      type: "payment",
                    },
                  ].map((notification) => (
                    <div key={notification.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        {notification.type === "booking" ? (
                          <Calendar className="h-5 w-5" />
                        ) : notification.type === "message" ? (
                          <MessageSquare className="h-5 w-5" />
                        ) : (
                          <CreditCard className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Notifications
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
