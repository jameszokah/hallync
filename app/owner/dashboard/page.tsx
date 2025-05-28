import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OwnerDashboard } from "@/components/owner/dashboard"

export default async function OwnerDashboardPage() {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase?.auth?.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Check if the user is a hostel owner
  const { data: user, error } = await supabase.from("users").select("role").eq("id", session.user.id).single()

  if (error || user.role !== "owner") {
    redirect("/")
  }

  // Fetch the owner's hostels
  const { data: hostels } = await supabase
    .from("hostels")
    .select(`
      *,
      rooms:rooms(count),
      bookings:bookings(count)
    `)
    .eq("owner_id", session.user.id)

  // Fetch recent bookings
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      user:users(first_name, last_name, email),
      hostel:hostels(name),
      room:rooms(type, price)
    `)
    .in("hostel_id", hostels?.map((h) => h.id) || [])
    .order("created_at", { ascending: false })
    .limit(5)

  return <OwnerDashboard hostels={hostels || []} recentBookings={recentBookings || []} />
}
