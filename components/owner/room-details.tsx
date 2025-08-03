"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateRoomAction } from "@/lib/actions/room";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit, Save, X, Image as ImageIcon, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";
import { amenities } from "@/lib/utils";

interface RoomImage {
  id: string;
  url: string;
}

interface Room {
  id: string;
  type: string;
  description: string | null;
  price: number;
  capacity: number;
  available: boolean;
  amenities: any;
  images: RoomImage[];
  hostel_id: string;
}

interface RoomDetailsProps {
  initialRoom: Room;
}

export function RoomDetails({ initialRoom }: RoomDetailsProps) {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
  const { data: session } = useSession();       
  const roomId = room.id;

  useEffect(() => {
    setRoom(initialRoom);
    setFormData({
      type: initialRoom.type,
      description: initialRoom.description || "",
      price: initialRoom.price,
      capacity: initialRoom.capacity,
      available: initialRoom.available,
      amenities: initialRoom.amenities || {},
    });
  }, [initialRoom]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isNumeric = type === "number";
    setFormData((prev: any) => ({
      ...prev,
      [name]: isNumeric ? Number(value) : value,
    }));
  };

  const handleAmenityChange = (name: string, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      amenities: { ...prev.amenities, [name]: checked },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!session?.user?.id) {
      toast.error("You must be logged in to update a room.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await updateRoomAction(roomId, {
        ...formData,
        images: newImages,
        owner_id: session.user.id,
      });
      if (result.success) {
        toast.success("Room updated successfully!");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update room.");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {isEditing ? `Editing: ${room.type}` : room.type}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Update the details for this room."
                : `Details for ${room.type} room.`}
            </CardDescription>
          </div>
          <motion.div layout>
            {isEditing ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Room
              </Button>
            )}
          </motion.div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={isEditing ? "editing" : "viewing"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  {/* Form fields for editing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type">Room Type</Label>
                      <Input
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (per semester/year)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="available">Available</Label>
                      <Switch
                        id="available"
                        checked={formData.available}
                        onCheckedChange={(checked) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            available: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Assuming a predefined list of amenities */}
                      {amenities.map((amenity) => (
                        <div
                          key={amenity.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={amenity.value}
                            checked={formData.amenities[amenity.value]}
                            onCheckedChange={(checked) =>
                              handleAmenityChange(amenity.value, !!checked)
                            }
                          />
                          <label
                            htmlFor={amenity.value}
                            className="text-sm font-medium capitalize"
                          >
                            {amenity.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {room.images.map((image) => (
                        <motion.div key={image.id} whileHover={{ scale: 1.05 }}>
                          <img
                            src={image.url}
                            alt="Room Image"
                            className="rounded-md object-cover h-32 w-full"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newImages">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload New Images
                    </Label>
                    <Input
                      id="newImages"
                      type="file"
                      multiple
                      onChange={handleImageChange}
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Details view */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold">Price</h3>
                      <p>GHS {room.price} per semester/year</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Capacity</h3>
                      <p>{room.capacity} person(s)</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Availability</h3>
                      <p>{room.available ? "Available" : "Not Available"}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Description</h3>
                    <p>{room.description || "No description provided."}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Amenities</h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {room.amenities &&
                        Object.entries(room.amenities).map(([key, value]) =>
                          value ? (
                            <div key={key} className="flex items-center gap-2">
                              <Checkbox checked={true} disabled />
                              <span className="capitalize">
                                {key.replace("_", " ")}
                              </span>
                            </div>
                          ) : null
                        )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {room.images.length > 0 ? (
                        room.images.map((image) => (
                          <motion.div
                            key={image.id}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Image
                              src={image.url}
                              width={100}
                              height={100}
                              alt="Room"
                              className="rounded-md object-cover h-32 w-full"
                            />
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-muted-foreground py-8">
                          <ImageIcon className="h-10 w-10 mx-auto" />
                          <p>No images for this room.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
