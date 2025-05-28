import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PaymentConfirmation } from "@/components/payment/payment-confirmation"

export default async function PaymentConfirmationPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const paymentId = params.id

  // Get the current user
  const {
    data: { session },
  } = await supabase?.auth?.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch the payment details
  const { data: payment, error } = await supabase
    .from("payments")
    .select(`
      *,
      booking:bookings(
        *,
        hostel:hostels(name),
        room:rooms(type, price)
      )
    `)
    .eq("id", paymentId)
    .single()

  if (error || !payment) {
    redirect("/dashboard")
  }

  // Check if the payment belongs to the current user
  if (payment.user_id !== session.user.id) {
    redirect("/dashboard")
  }

  return <PaymentConfirmation payment={payment} />
}
