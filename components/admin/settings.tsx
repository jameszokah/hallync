"use client"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface AdminSettingsProps {
  settings: Record<string, any>
}

const generalSettingsSchema = z.object({
  platform_name: z.string().min(1, "Platform name is required"),
  contact_email: z.string().email("Invalid email address"),
  support_phone: z.string().optional(),
  maintenance_mode: z.boolean().default(false),
})

const bookingSettingsSchema = z.object({
  booking_fee_percentage: z.coerce.number().min(0).max(100),
  allow_instant_booking: z.boolean().default(true),
  cancellation_policy: z.string().min(10, "Cancellation policy is required"),
})

export function AdminSettings({ settings }: AdminSettingsProps) {
  const router = useRouter()
  const { toast } = useToast()

  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      platform_name: settings.platform_name || "Hallynk",
      contact_email: settings.contact_email || "",
      support_phone: settings.support_phone || "",
      maintenance_mode: settings.maintenance_mode || false,
    },
  })

  const bookingForm = useForm<z.infer<typeof bookingSettingsSchema>>({
    resolver: zodResolver(bookingSettingsSchema),
    defaultValues: {
      booking_fee_percentage: settings.booking_fee_percentage || 5,
      allow_instant_booking: settings.allow_instant_booking !== false,
      cancellation_policy: settings.cancellation_policy || "",
    },
  })

  const onSaveGeneral = (data: z.infer<typeof generalSettingsSchema>) => {
    // In a real app, this would be a server action
    toast({
      title: "Settings saved",
      description: "General settings have been updated",
    })
    router.refresh()
  }

  const onSaveBooking = (data: z.infer<typeof bookingSettingsSchema>) => {
    // In a real app, this would be a server action
    toast({
      title: "Settings saved",
      description: "Booking settings have been updated",
    })
    router.refresh()
  }

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="booking">Booking</TabsTrigger>
        <TabsTrigger value="payment">Payment</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure general platform settings</CardDescription>
          </CardHeader>
          <form onSubmit={generalForm.handleSubmit(onSaveGeneral)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform_name">Platform Name</Label>
                <Input id="platform_name" {...generalForm.register("platform_name")} />
                {generalForm.formState.errors.platform_name && (
                  <p className="text-sm text-destructive">{generalForm.formState.errors.platform_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" type="email" {...generalForm.register("contact_email")} />
                {generalForm.formState.errors.contact_email && (
                  <p className="text-sm text-destructive">{generalForm.formState.errors.contact_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_phone">Support Phone</Label>
                <Input id="support_phone" {...generalForm.register("support_phone")} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance_mode"
                  checked={generalForm.watch("maintenance_mode")}
                  onCheckedChange={(checked) => generalForm.setValue("maintenance_mode", checked)}
                />
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="booking">
        <Card>
          <CardHeader>
            <CardTitle>Booking Settings</CardTitle>
            <CardDescription>Configure booking and reservation settings</CardDescription>
          </CardHeader>
          <form onSubmit={bookingForm.handleSubmit(onSaveBooking)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking_fee_percentage">Booking Fee Percentage</Label>
                <div className="flex items-center">
                  <Input
                    id="booking_fee_percentage"
                    type="number"
                    min="0"
                    max="100"
                    className="w-24"
                    {...bookingForm.register("booking_fee_percentage")}
                  />
                  <span className="ml-2">%</span>
                </div>
                {bookingForm.formState.errors.booking_fee_percentage && (
                  <p className="text-sm text-destructive">
                    {bookingForm.formState.errors.booking_fee_percentage.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allow_instant_booking"
                  checked={bookingForm.watch("allow_instant_booking")}
                  onCheckedChange={(checked) => bookingForm.setValue("allow_instant_booking", checked)}
                />
                <Label htmlFor="allow_instant_booking">Allow Instant Booking</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                <Textarea id="cancellation_policy" rows={5} {...bookingForm.register("cancellation_policy")} />
                {bookingForm.formState.errors.cancellation_policy && (
                  <p className="text-sm text-destructive">{bookingForm.formState.errors.cancellation_policy.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="payment">
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure payment methods and processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Payment settings configuration will be implemented here.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure email and SMS notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Notification settings configuration will be implemented here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
