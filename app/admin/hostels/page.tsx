import { createClient } from "@/lib/supabase/server"
import { AdminHostelList } from "@/components/admin/hostel-list"

export default async function AdminHostelsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; verified?: string; university?: string; search?: string }>
  }) {
  const searchParam = await searchParams
  const supabase = await createClient()
  const page = Number.parseInt(searchParam.page || "1")
  const pageSize = 10
  const verified = searchParam.verified || ""
  const university = searchParam.university || ""
  const search = searchParam.search || ""

  // Fetch universities for filter dropdown
  const { data: universities } = await supabase.from("universities").select("id, name").order("name")

  // Build the query
  let query = supabase
    .from("hostels")
    .select("id, name, location, verified, university, created_at, users!inner(email)", { count: "exact" })

  // Apply filters
  if (verified === "true") {
    query = query.eq("verified", true)
  } else if (verified === "false") {
    query = query.eq("verified", false)
  }

  if (university) {
    query = query.eq("university", university)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`)
  }

  // Paginate
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: hostels, count, error } = await query.range(from, to).order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching hostels:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hostels</h1>
        <p className="text-muted-foreground">Manage and verify hostels</p>
      </div>

      <AdminHostelList
        hostels={hostels || []}
        totalHostels={count || 0}
        currentPage={page}
        pageSize={pageSize}
        verified={verified}
        university={university}
        search={search}
        universities={universities || []}
      />
    </div>
  )
}
