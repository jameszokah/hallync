import { createClient } from "@/lib/supabase/server"
import { AdminUserList } from "@/components/admin/user-list"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string; search?: string }>
  }) {
  
  const searchParam = await searchParams;
  
  const supabase = await createClient()
  const page = Number.parseInt(searchParam.page || "1")
  const pageSize = 10
  const role = searchParam.role || ""
  const search = searchParam.search || ""

  // Build the query
  let query = supabase
    .from("users")
    .select("id, email, first_name, last_name, role, university, created_at", { count: "exact" })

  // Apply filters
  if (role) {
    query = query.eq("role", role)
  }

  if (search) {
    query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
  }

  // Paginate
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: users, count, error } = await query.range(from, to).order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage platform users</p>
      </div>

      <AdminUserList
        users={users || []}
        totalUsers={count || 0}
        currentPage={page}
        pageSize={pageSize}
        role={role}
        search={search}
      />
    </div>
  )
}
