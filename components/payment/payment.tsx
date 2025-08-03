"use client"
import { useState } from "react"
import { usePaystackPayment } from "react-paystack"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateBookingStatus } from "@/lib/actions/payment"
import { CheckCircle, AlertTriangle, Loader, ArrowLeft, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export function Payment({ booking }: { booking: any }) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const config = {
    reference: booking.id,
    email: booking.user.email,
    currency: "GHS",
    amount: booking.amount * 100, // Paystack amount is in pesewas
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  }

  const initializePayment = usePaystackPayment(config)

  const onSuccess = async (reference: any) => {
    setIsLoading(true)
    const result = await updateBookingStatus(
      booking.id,
      reference.reference,
      "CONFIRMED",
      "COMPLETED"
    )
    if (result.success) {
      toast.success("Payment successful!")
      setPaymentStatus("success")
    } else {
      toast.error(result.error || "Failed to update booking status.")
      setPaymentStatus("failed")
    }
    setIsLoading(false)
  }

  const onClose = () => {
    toast.info("Payment dialog closed.")
  }

  const handlePayment = () => {
    setIsLoading(true)
    initializePayment({onSuccess, onClose})
    setIsLoading(false)
  }

  if (paymentStatus === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto py-8 text-center"
      >
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <CardTitle className="mt-4">Payment Successful!</CardTitle>
            <CardDescription>Your booking is confirmed.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>A confirmation email has been sent to {booking.user.email}.</p>
            <Button className="mt-6" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (paymentStatus === "failed") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto py-8 text-center"
      >
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            <CardTitle className="mt-4">Payment Failed</CardTitle>
            <CardDescription>Something went wrong. Please try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="mt-6" onClick={() => setPaymentStatus("idle")}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <header className="flex justify-between items-center mb-8">
          <Link href="/"> 
            <Image src="/logo.svg" alt="Hallynk" width={100} height={100} />
            </Link>
        <h1 className="md:text-2xl font-bold">Confirm Your Booking</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto py-8"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Confirm Your Booking</CardTitle>
          <CardDescription>Review your details and complete your payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Booking Details</h3>
            <div className="flex justify-between">
              <span>Hostel:</span>
              <span>{booking.room.hostel.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Room:</span>
              <span>{booking.room.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Move-in Date:</span>
              <span>{new Date(booking.check_in_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Move-out Date:</span>
              <span>{new Date(booking.check_out_date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Payment Summary</h3>
            <div className="flex justify-between">
              <span>Room Price:</span>
              <span>GHS {booking.amount}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>GHS {booking.amount}</span>
            </div>
          </div>
          <Button onClick={handlePayment} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader className="animate-spin" /> : `Pay GHS ${booking.amount}`}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
    </div>
  )
} 