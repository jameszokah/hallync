"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface Payment {
  id: string
  amount: number
  payment_method: string
  provider: string | null
  status: "pending" | "completed" | "failed"
  created_at: string
  booking: {
    id: string
    hostel: {
      name: string
    }
    room: {
      type: string
      price: number
    }
  }
}

export function PaymentConfirmation({ payment }: { payment: Payment }) {
  const router = useRouter()
  const [status, setStatus] = useState<"pending" | "completed" | "failed">(payment.status)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // If payment is already completed or failed, no need to check
    if (payment.status !== "pending") {
      setStatus(payment.status)
      setIsLoading(false)
      return
    }

    // Poll for payment status updates
    const interval = setInterval(async () => {
      const { data, error } = await supabase.from("payments").select("status").eq("id", payment.id).single()

      if (!error && data) {
        setStatus(data.status)

        if (data.status !== "pending") {
          clearInterval(interval)
          setIsLoading(false)
        }
      }
    }, 2000)

    // Simulate payment completion after 10 seconds for demo purposes
    const timeout = setTimeout(() => {
      setStatus("completed")
      setIsLoading(false)
      clearInterval(interval)
    }, 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [payment.id, payment.status])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            Payment {status === "completed" ? "Successful" : status === "failed" ? "Failed" : "Processing"}
          </CardTitle>
          <CardDescription>
            {status === "pending"
              ? "Your payment is being processed. Please wait..."
              : status === "completed"
                ? "Your payment has been successfully processed."
                : "There was an issue processing your payment."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "pending" ? (
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          ) : status === "completed" ? (
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-destructive mb-4" />
          )}

          <div className="text-center mb-6">
            <div className="text-2xl font-bold mb-1">₵{payment.amount.toLocaleString()}</div>
            <div className="text-muted-foreground">
              {payment.payment_method === "mobile_money"
                ? `via ${payment.provider} Mobile Money`
                : payment.payment_method === "bank_transfer"
                  ? "via Bank Transfer"
                  : "via Credit/Debit Card"}
            </div>
          </div>

          <div className="w-full space-y-2 border-t border-b py-4 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hostel:</span>
              <span className="font-medium">{payment.booking.hostel.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room Type:</span>
              <span className="font-medium">{payment.booking.room.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking ID:</span>
              <span className="font-medium">{payment.booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Date:</span>
              <span className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {status === "pending" && (
            <div className="text-sm text-muted-foreground text-center mb-4">
              This may take a few moments. Please do not close this page.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {status === "completed" && (
            <Button className="w-full" onClick={() => router.push(`/bookings/${payment.booking.id}`)}>
              View Booking Details
            </Button>
          )}

          {status === "failed" && (
            <Button className="w-full" onClick={() => router.push(`/payment/retry/${payment.id}`)}>
              Try Again
            </Button>
          )}

          <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
