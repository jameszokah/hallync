"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Upload, Wifi, Shield, Droplets, Zap, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createHostel } from "@/lib/actions/hostel"

interface University {
  id: string
  name: string
}

interface NewHostelFormProps {
  universities: University[]
  userId: string
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Hostel name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  location: z.string().min(5, { message: "Location must be at least 5 characters" }),
  university: z.string().min(1, { message: "Please select a university" }),
  distance_to_campus: z.string().min(1, { message: "Please provide distance to campus" }),
  amenities: z.object({
    wifi: z.boolean().default(false),
    security: z.boolean().default(false),
    water: z.boolean().default(false),
    electricity: z.boolean().default(false),
    study_room: z.boolean().default(false),
  }),
})

export function NewHostelForm({ universities, userId }: NewHostelFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amenities: {
        wifi: false,
        security: false,
        water: false,
        electricity: false,
        study_room: false,
      },
    },
  })

  const amenities = watch("amenities")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      setImages((prev) => [...prev, ...fileArray])
    }
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const result = await createHostel({
        ...data,
        owner_id: userId,
        images,
      })

      if (result.success) {
        toast({
          title: "Hostel created",
          description: "Your hostel has been successfully created",
        })
        // router.push(`/owner/hostels/${result.hostelId}`)
      } else {
        throw new Error(result.error || "Failed to create hostel")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the hostel",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/owner/dashboard" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-xl">Add New Hostel</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Hostel Information</CardTitle>
            <CardDescription>
              Provide details about your hostel to attract students. Complete and accurate information increases booking
              chances.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Hostel Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your hostel, its features, and what makes it special"
                  className="min-h-32"
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="e.g. East Legon, Near Starbites Restaurant"
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university">Nearest University</Label>
                  <Select onValueChange={(value) => setValue("university", value)} defaultValue={watch("university")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((university) => (
                        <SelectItem key={university.id} value={university.id}>
                          {university.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.university && <p className="text-sm text-destructive">{errors.university.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance_to_campus">Distance to Campus</Label>
                  <Input
                    id="distance_to_campus"
                    {...register("distance_to_campus")}
                    placeholder="e.g. 5 min walk, 2 km"
                  />
                  {errors.distance_to_campus && (
                    <p className="text-sm text-destructive">{errors.distance_to_campus.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Amenities</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wifi"
                      checked={amenities.wifi}
                      onCheckedChange={(checked) => setValue("amenities.wifi", !!checked)}
                    />
                    <Label htmlFor="wifi" className="flex items-center">
                      <Wifi className="h-4 w-4 mr-2" /> WiFi
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="security"
                      checked={amenities.security}
                      onCheckedChange={(checked) => setValue("amenities.security", !!checked)}
                    />
                    <Label htmlFor="security" className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" /> 24/7 Security
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="water"
                      checked={amenities.water}
                      onCheckedChange={(checked) => setValue("amenities.water", !!checked)}
                    />
                    <Label htmlFor="water" className="flex items-center">
                      <Droplets className="h-4 w-4 mr-2" /> Constant Water
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="electricity"
                      checked={amenities.electricity}
                      onCheckedChange={(checked) => setValue("amenities.electricity", !!checked)}
                    />
                    <Label htmlFor="electricity" className="flex items-center">
                      <Zap className="h-4 w-4 mr-2" /> Backup Power
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="study_room"
                      checked={amenities.study_room}
                      onCheckedChange={(checked) => setValue("amenities.study_room", !!checked)}
                    />
                    <Label htmlFor="study_room" className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" /> Study Room
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Hostel Images</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop images here, or click to select files
                  </p>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById("images")?.click()}>
                    Select Images
                  </Button>
                  {images.length > 0 && (
                    <div className="mt-4 text-sm">
                      {images.length} {images.length === 1 ? "image" : "images"} selected
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload at least 3 high-quality images of your hostel. Include exterior, rooms, and common areas.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Hostel"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
