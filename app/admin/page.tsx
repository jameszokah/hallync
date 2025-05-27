import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminDashboardStats } from "@/components/admin/dashboard-stats"
import { AdminRecentActivity } from "@/components/admin/recent-activity"
import { AdminHostelVerification } from "@/components/admin/hostel-verification"

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Fetch dashboard statistics
  const [
    { data: userCount },
    { data: hostelCount },
    { data: bookingCount },
    { data: paymentSum },
    { data: pendingHostels },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("hostels").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.rpc("get_total_payments"),
    supabase
      .from("hostels")
      .select("id, name, location, owner_id, created_at, users!inner(email)")
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("activity_log")
      .select("id, action, entity_type, entity_id, user_id, created_at, users!inner(email, first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const stats = {
    userCount: userCount?.count || 0,
    hostelCount: hostelCount?.count || 0,
    bookingCount: bookingCount?.count || 0,
    totalRevenue: paymentSum || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <AdminDashboardStats stats={stats} />

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="verification">Pending Verification</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="space-y-4 mt-4">
          <AdminRecentActivity activities={recentActivity || []} />
        </TabsContent>
        <TabsContent value="verification" className="space-y-4 mt-4">
          <AdminHostelVerification hostels={pendingHostels || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
