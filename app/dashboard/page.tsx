import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UserDashboard } from "@/components/user-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase?.auth?.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (userError) {
    console.error("Error fetching user data:", userError)
  }

  // Fetch user's active bookings
  const { data: activeBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      *,
      hostel:hostels(id, name, location),
      room:rooms(type, price)
    `)
    .eq("user_id", session.user.id)
    .in("status", ["pending", "confirmed"])
    .order("created_at", { ascending: false })

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError)
  }

  // Fetch user's saved hostels
  const { data: savedHostels, error: savedError } = await supabase
    .from("saved_hostels")
    .select(`
      hostel_id,
      hostels(id, name, location, university, rating, reviews)
    `)
    .eq("user_id", session.user.id)
    .limit(5)

  if (savedError) {
    console.error("Error fetching saved hostels:", savedError)
  }

  // Fetch recently viewed hostels
  const { data: recentlyViewed, error: recentError } = await supabase
    .from("hostel_views")
    .select(`
      hostel_id,
      viewed_at,
      hostels(id, name, location, university, rating, reviews)
    `)
    .eq("user_id", session.user.id)
    .order("viewed_at", { ascending: false })
    .limit(4)

  if (recentError) {
    console.error("Error fetching recently viewed hostels:", recentError)
  }

  // Fetch recommended hostels based on user's university
  const { data: recommendedHostels, error: recommendedError } = await supabase
    .from("hostels")
    .select("id, name, location, university, rating, reviews")
    .eq("university", userData?.university || "")
    .eq("verified", true)
    .limit(4)

  if (recommendedError) {
    console.error("Error fetching recommended hostels:", recommendedError)
  }

  // Fetch unread messages
  const { count: unreadCount, error: unreadError } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", session.user.id)
    .eq("read", false)

  if (unreadError) {
    console.error("Error fetching unread messages:", unreadError)
  }

  return (
    <UserDashboard
      user={userData || null}
      activeBookings={activeBookings || []}
      savedHostels={savedHostels?.map((item) => item.hostels) || []}
      recentlyViewed={
        recentlyViewed?.map((item) => ({
          ...item.hostels,
          viewed_at: item.viewed_at,
        })) || []
      }
      recommendedHostels={recommendedHostels || []}
      unreadCount={unreadCount || 0}
    />
  )
}
