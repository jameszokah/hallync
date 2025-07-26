"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Bed,
  Users,
  DollarSign,
  Check,
  Trash2,
  Upload,
  PlusCircle,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { createRoom } from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const roomFormSchema = z.object({
  type: z.string().min(2, {
    message: "Room type must be at least 2 characters.",
  }),
  description: z
    .string()
    .min(10, {
      message: "Description should be at least 10 characters.",
    })
    .optional(),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  capacity: z.coerce.number().int().positive({
    message: "Capacity must be a positive integer.",
  }),
  available: z.coerce.number().int().positive({
    message: "Available rooms must be a positive integer.",
  }),
  has_bathroom: z.boolean().default(false),
  has_balcony: z.boolean().default(false),
  has_ac: z.boolean().default(false),
  has_tv: z.boolean().default(false),
  has_fridge: z.boolean().default(false),
  is_furnished: z.boolean().default(false),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

export default function NewRoomPage() {
  const { hostel_id } = useParams() as { hostel_id: string };
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      type: "",
      description: "",
      price: undefined,
      capacity: undefined,
      available: undefined,
      has_bathroom: false,
      has_balcony: false,
      has_ac: false,
      has_tv: false,
      has_fridge: false,
      is_furnished: false,
    },
    mode: "onChange",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);

      // Filter for images only
      const imageFiles = fileArray.filter((file) =>
        file.type.startsWith("image/")
      );

      // Create preview URLs
      const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));

      setImages((prev) => [...prev, ...imageFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));

    // Revoke the URL to free up memory
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: RoomFormValues) {
    if (images.length === 0) {
      toast.error("Please upload at least one room image");
      return;
    }

    setIsSubmitting(true);
    try {
      // Process amenities
      const amenities = {
        has_bathroom: data.has_bathroom,
        has_balcony: data.has_balcony,
        has_ac: data.has_ac,
        has_tv: data.has_tv,
        has_fridge: data.has_fridge,
        is_furnished: data.is_furnished,
      };

      // Convert to proper format for API
      const amenitiesString = JSON.stringify(amenities);

      const result = await createRoom({
        ...data,
        hostel_id,
        amenities: amenitiesString,
        images,
      });

      toast.success("Room created successfully!");
      form.reset();
      setImages([]);
      setImagePreviews([]);

      // Navigate back to hostel page
      router.push(`/owner/hostels/${hostel_id}`);
    } catch (error) {
      toast.error("Failed to create room. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Link href={`/owner/hostels/${hostel_id}`}>
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Hostel
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add a New Room</h1>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Room Details</CardTitle>
                    <CardDescription>
                      Basic information about your room
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Bed className="h-4 w-4" /> Room Type
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Single, Double, Shared"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Specify the type of room
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the room, its features, view, etc."
                              className="resize-none min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Users className="h-4 w-4" /> Capacity
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="1"
                                  {...field}
                                />
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">
                                        Maximum number of students per room
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="available"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Units</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" /> Price (per
                            semester/year)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                ₵
                              </span>
                              <Input
                                type="number"
                                placeholder="Price"
                                className="pl-7"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Room Features</CardTitle>
                    <CardDescription>
                      Select the amenities available in this room
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      <FormField
                        control={form.control}
                        name="is_furnished"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Furnished
                              </FormLabel>
                              <FormDescription>
                                Room comes with basic furniture
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="has_bathroom"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Private Bathroom
                              </FormLabel>
                              <FormDescription>
                                Room has a private bathroom
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="has_balcony"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Balcony
                              </FormLabel>
                              <FormDescription>
                                Room has a private balcony
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="has_ac"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Air Conditioning
                              </FormLabel>
                              <FormDescription>
                                Room has air conditioning
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="has_tv"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">TV</FormLabel>
                              <FormDescription>
                                Room comes with a television
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="has_fridge"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Refrigerator
                              </FormLabel>
                              <FormDescription>
                                Room has a mini fridge
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Room Images</CardTitle>
                  <CardDescription>
                    Upload clear photos of the room
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full max-w-xs h-32 flex flex-col justify-center items-center border-dashed gap-2"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload room images
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Upload clear, well-lit photos of the room
                      </span>
                    </Button>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-3">
                        Selected Images
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            className="relative group aspect-video rounded-md overflow-hidden border"
                          >
                            <Image
                              src={preview}
                              alt={`Room preview ${index}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeImage(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-md">
                                Primary
                              </div>
                            )}
                          </div>
                        ))}
                        <div
                          className="aspect-video rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <PlusCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Room..." : "Add Room"}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
