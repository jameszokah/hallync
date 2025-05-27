"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface PaymentData {
  bookingId: string
  userId: string
  amount: number
  paymentMethod: "mobile_money" | "bank_transfer" | "card"
  provider: string | null
  phoneNumber: string | null
}

export async function processPayment(data: PaymentData) {
  const supabase = await createClient()

  try {
    // In a real application, you would integrate with a payment gateway here
    // For Ghana, you might use Paystack, Flutterwave, or a local mobile money API

    // Create a payment record in the database
    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        booking_id: data.bookingId,
        user_id: data.userId,
        amount: data.amount,
        payment_method: data.paymentMethod,
        provider: data.provider,
        transaction_id: `TRANS-${Date.now()}`, // In a real app, this would come from the payment gateway
        status: "pending", // Initially set as pending
      })
      .select()
      .single()

    if (error) throw error

    // Update the booking payment status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({ payment_status: "pending" })
      .eq("id", data.bookingId)

    if (bookingError) throw bookingError

    // Revalidate the booking and payment pages
    revalidatePath(`/bookings/${data.bookingId}`)
    revalidatePath("/dashboard")

    // In a real application, you would redirect to the payment gateway here
    // and handle the callback to update the payment status

    // For this example, we'll simulate a successful payment
    // In a real app, this would be handled by a webhook from the payment gateway
    setTimeout(async () => {
      await supabase.from("payments").update({ status: "completed" }).eq("id", payment.id)

      await supabase.from("bookings").update({ payment_status: "completed" }).eq("id", data.bookingId)

      revalidatePath(`/bookings/${data.bookingId}`)
      revalidatePath("/dashboard")
    }, 5000) // Simulate a 5-second delay for the payment to complete

    return {
      success: true,
      paymentId: payment.id,
    }
  } catch (error: any) {
    console.error("Payment processing error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
