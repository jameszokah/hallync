import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewHostelForm } from "@/components/owner/new-hostel-form"

export default async function NewHostelPage() {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Check if the user is a hostel owner
  const { data: user, error } = await supabase.from("users").select("role").eq("id", session.user.id).single()

  if (error || user.role !== "owner") {
    redirect("/")
  }

  // Fetch universities for the dropdown
  const { data: universities } = await supabase.from("universities").select("id, name").order("name")

  return <NewHostelForm universities={universities || []} userId={session.user.id} />
}
