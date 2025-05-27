import { createClient } from "@/lib/supabase/server"
import { AdminUniversityList } from "@/components/admin/university-list"

export default async function AdminUniversitiesPage() {
  const supabase = await createClient()

  // Fetch universities
  const { data: universities, error } = await supabase
    .from("universities")
    .select("id, name, location, created_at")
    .order("name")

  if (error) {
    console.error("Error fetching universities:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Universities</h1>
        <p className="text-muted-foreground">Manage universities on the platform</p>
      </div>

      <AdminUniversityList universities={universities || []} />
    </div>
  )
}
