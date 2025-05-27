"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CreditCard, Phone } from "lucide-react"
import { processPayment } from "@/lib/actions/payment"

interface PaymentFormProps {
  bookingId: string
  amount: number
  description: string
}

export function PaymentForm({ bookingId, amount, description }: PaymentFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "bank_transfer" | "card">("mobile_money")
  const [provider, setProvider] = useState<string>("mtn")
  const [phoneNumber, setPhoneNumber] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a payment",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await processPayment({
        bookingId,
        userId: user.id,
        amount,
        paymentMethod,
        provider: paymentMethod === "mobile_money" ? provider : null,
        phoneNumber: paymentMethod === "mobile_money" ? phoneNumber : null,
      })

      if (result.success) {
        toast({
          title: "Payment initiated",
          description: "Please check your phone to complete the payment",
        })

        // Redirect to payment confirmation page
        router.push(`/payment/confirmation/${result.paymentId}`)
      } else {
        throw new Error(result.error || "Payment failed")
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <div className="text-lg font-semibold mb-4">Amount: ₵{amount.toLocaleString()}</div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "mobile_money" | "bank_transfer" | "card")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile_money" id="mobile_money" />
                    <Label htmlFor="mobile_money" className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Mobile Money
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Bank Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit/Debit Card
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "mobile_money" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Mobile Money Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger id="provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                        <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                        <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Money Number</Label>
                    <Input
                      id="phone"
                      placeholder="e.g. 024XXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required={paymentMethod === "mobile_money"}
                    />
                  </div>
                </>
              )}

              {paymentMethod === "bank_transfer" && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="font-medium mb-2">Bank Transfer Details:</p>
                  <p>Bank: Ghana Commercial Bank</p>
                  <p>Account Name: Hallynk Ghana Ltd</p>
                  <p>Account Number: 1234567890</p>
                  <p>Reference: BOOKING-{bookingId}</p>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" required={paymentMethod === "card"} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" required={paymentMethod === "card"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" required={paymentMethod === "card"} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₵${amount.toLocaleString()}`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
