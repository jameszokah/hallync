"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { createRoom } from "./actions";
import { toast } from "sonner";
import { useParams } from "next/navigation";

const roomFormSchema = z.object({
  type: z.string().min(2, {
    message: "Room type must be at least 2 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  capacity: z.coerce.number().int().positive({
    message: "Capacity must be a positive integer.",
  }),
  available: z.coerce.number().int().positive({
    message: "Available rooms must be a positive integer.",
  }),
  amenities: z.string().optional(),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

interface NewRoomPageProps {
  params: {
    hostel_id: string;
  };
}

export default function NewRoomPage() {
  const { hostel_id } = useParams() as { hostel_id: string };
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      type: "",
      amenities: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: RoomFormValues) {
    try {
      await createRoom({ ...data, hostel_id: hostel_id });
      toast.success("Room created successfully!");
      form.reset();
      // Potentially redirect or update UI further
    } catch (error) {
      toast.error("Failed to create room. Please try again.");
      console.error(error);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Add a New Room</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Single, Double, Shared"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Specify the type of room (e.g., single, double, 4-in-1).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (per period, e.g., semester, year)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (number of occupants)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter capacity"
                    {...field}
                  />
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
                <FormLabel>Number of Available Rooms of this Type</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="How many such rooms are available?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amenities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amenities</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List amenities, e.g., Wi-Fi, AC, Balcony, Private Bathroom. (Comma-separated)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter amenities as a comma-separated list. This will be stored
                  as a JSON object.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating Room..." : "Add Room"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
