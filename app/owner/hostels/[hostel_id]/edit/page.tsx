"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getHostelById, updateHostelAction } from "@/lib/actions/hostel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { amenities } from "@/lib/utils";
import { MapPicker } from "@/components/ui/map-picker";
import { toast as sonnerToast } from "sonner";

interface Hostel {
  id: string;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  university: string;
  distance_to_campus: string;
  owner_id: string;
  amenities: Record<string, boolean>;
  images: { url: string }[];
}

export default function EditHostelPage() {
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationType, setLocationType] = useState<"map" | "manual">("map");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const params = useParams();
  const router = useRouter();
  const hostelId = params.hostel_id as string;

  useEffect(() => {
    if (hostelId) {
      const fetchHostel = async () => {
        setIsLoading(true);
        try {
          const fetchedHostel = await getHostelById(hostelId);
          if (fetchedHostel) {
            setHostel(fetchedHostel as Hostel);
            setFormData({
              name: fetchedHostel.name,
              description: fetchedHostel.description,
              location: fetchedHostel.location,
              latitude: fetchedHostel.latitude,
              longitude: fetchedHostel.longitude,
              university: fetchedHostel.university,
              distance_to_campus: fetchedHostel.distance_to_campus,
              amenities: fetchedHostel.amenities,
              owner_id: fetchedHostel.owner_id,
            });
          }
        } catch (error) {
          sonnerToast.error("Failed to fetch hostel details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchHostel();
    }
  }, [hostelId, sonnerToast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateHostelAction(hostelId, {
        ...formData,
        images: newImages,
      });
      if (result.success) {
        sonnerToast.success("Hostel updated successfully!");
        router.push(`/owner/hostels/${hostelId}`);
      } else {
        sonnerToast.error(result.error || "Failed to update hostel.");
      }
    } catch (error: any) {
      sonnerToast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Hostel not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Edit {hostel.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Hostel Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="flex gap-2 rounded-md bg-muted p-1">
                  <Button
                    type="button"
                    variant={locationType === "map" ? "default" : "ghost"}
                    onClick={() => setLocationType("map")}
                    className="flex-1"
                  >
                    Select on Map
                  </Button>
                  <Button
                    type="button"
                    variant={locationType === "manual" ? "default" : "ghost"}
                    onClick={() => setLocationType("manual")}
                    className="flex-1"
                  >
                    Enter Manually
                  </Button>
                </div>

                {locationType === "manual" ? (
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                ) : (
                  <div>
                    <div className="h-64 w-full rounded-md border overflow-hidden">
                      <MapPicker
                        mode="picker"
                        initialLocation={
                          formData.latitude && formData.longitude
                            ? {
                                latitude: formData.latitude,
                                longitude: formData.longitude,
                              }
                            : undefined
                        }
                        onLocationChange={async (loc) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            latitude: loc.latitude,
                            longitude: loc.longitude,
                          }));
                          setIsGeocoding(true);
                          try {
                            const response = await fetch(
                              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}`
                            );
                            const data = await response.json();
                            setFormData((prev: any) => ({
                              ...prev,
                              location: data.display_name || prev.location,
                            }));
                          } catch (error) {
                            sonnerToast.error("Failed to fetch address.");
                          } finally {
                            setIsGeocoding(false);
                          }
                        }}
                      />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {isGeocoding ? "Fetching address..." : formData.location}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance_to_campus">
                Distance to Campus (in km)
              </Label>
              <Input
                id="distance_to_campus"
                name="distance_to_campus"
                value={formData.distance_to_campus}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-4">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                {hostel.images.map((image) => (
                  <motion.div key={image.url} whileHover={{ scale: 1.05 }}>
                    <img
                      src={image.url}
                      alt="Hostel Image"
                      className="rounded-md object-cover h-32 w-full"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newImages">Upload New Images</Label>
              <Input
                id="newImages"
                type="file"
                multiple
                onChange={handleImageChange}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Hostel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
