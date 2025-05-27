"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function verifyHostel(hostelId: string) {
  const supabase = await createClient()

  try {
    // Update the hostel to verified
    const { error } = await supabase.from("hostels").update({ verified: true }).eq("id", hostelId)

    if (error) throw error

    // Log the activity
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      await supabase.from("activity_log").insert({
        user_id: session.user.id,
        action: "verified",
        entity_type: "hostel",
        entity_id: hostelId,
      })
    }

    revalidatePath("/admin")
    revalidatePath("/admin/hostels")
    revalidatePath(`/admin/hostels/${hostelId}`)

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Error verifying hostel:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function rejectHostel(hostelId: string) {
  const supabase = await createClient()

  try {
    // We could either delete the hostel or mark it as rejected
    // For this example, we'll mark it as rejected
    const { error } = await supabase.from("hostels").update({ verified: false, status: "rejected" }).eq("id", hostelId)

    if (error) throw error

    // Log the activity
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      await supabase.from("activity_log").insert({
        user_id: session.user.id,
        action: "rejected",
        entity_type: "hostel",
        entity_id: hostelId,
      })
    }

    revalidatePath("/admin")
    revalidatePath("/admin/hostels")
    revalidatePath(`/admin/hostels/${hostelId}`)

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Error rejecting hostel:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
