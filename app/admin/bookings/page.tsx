import { createClient } from "@/lib/supabase/server"
import { AdminBookingList } from "@/components/admin/booking-list"

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
  }) {
  const searchParam = await searchParams;
  
  const supabase = await createClient()
  const page = Number.parseInt(searchParam.page || "1")
  const pageSize = 10
  const status = searchParam.status || ""
  const search = searchParam.search || ""

  // Build the query
  let query = supabase.from("bookings").select(
    `
      id, 
      check_in_date, 
      check_out_date, 
      status, 
      payment_status, 
      created_at,
      users!inner(email, first_name, last_name),
      hostels!inner(name),
      rooms!inner(type, price)
      `,
    { count: "exact" },
  )

  // Apply filters
  if (status) {
    query = query.eq("status", status)
  }

  if (search) {
    // This is a simplified search - in a real app, you might want to search across related tables
    query = query.or(`hostels.name.ilike.%${search}%,users.email.ilike.%${search}%`)
  }

  // Paginate
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: bookings, count, error } = await query.range(from, to).order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">Manage all bookings on the platform</p>
      </div>

      <AdminBookingList
        bookings={bookings || []}
        totalBookings={count || 0}
        currentPage={page}
        pageSize={pageSize}
        status={status}
        search={search}
      />
    </div>
  )
}
