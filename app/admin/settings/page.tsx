import { createClient } from "@/lib/supabase/server"
import { AdminSettings } from "@/components/admin/settings"

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  // Fetch current settings
  const { data: settings, error } = await supabase.from("settings").select("*").single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching settings:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage platform settings and configuration</p>
      </div>

      <AdminSettings settings={settings || {}} />
    </div>
  )
}
