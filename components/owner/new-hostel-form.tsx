"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Wifi,
  Shield,
  Droplets,
  Zap,
  BookOpen,
  MapPin,
  Building,
  School,
  Ruler,
  CheckCircle,
  X,
  XCircle,
  ChevronRight,
  Trash2,
  PlusCircle,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { createHostelAction } from "@/lib/actions/hostel";
import { cn } from "@/lib/utils";

interface University {
  id: string;
  name: string;
}

interface NewHostelFormProps {
  universities: University[];
  userId: string;
}

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Hostel name must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  location: z
    .string()
    .min(5, { message: "Location must be at least 5 characters" }),
  university: z.string().min(1, { message: "Please select a university" }),
  distance_to_campus: z
    .string()
    .min(1, { message: "Please provide distance to campus" }),
  amenities: z.object({
    wifi: z.boolean(),
    security: z.boolean(),
    water: z.boolean(),
    electricity: z.boolean(),
    study_room: z.boolean(),
    air_conditioning: z.boolean(),
    kitchen: z.boolean(),
    laundry: z.boolean(),
  }),
});

type FormData = z.infer<typeof formSchema>;

export function NewHostelForm({ universities, userId }: NewHostelFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: "Basic Information",
      description: "Enter hostel name, description and location",
    },
    {
      title: "University & Distance",
      description: "Select the nearest university and distance",
    },
    {
      title: "Amenities",
      description: "Add available facilities and services",
    },
    { title: "Images", description: "Upload photos of your hostel" },
    { title: "Review & Submit", description: "Review information and submit" },
  ];

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
    trigger,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      amenities: {
        wifi: false,
        security: false,
        water: false,
        electricity: false,
        study_room: false,
        air_conditioning: false,
        kitchen: false,
        laundry: false,
      },
    },
  });

  useEffect(() => {
    // Set progress based on current step
    setProgress(((currentStep + 1) / steps.length) * 100);
  }, [currentStep, steps.length]);

  const watchAllFields = watch();

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
    // Remove from both arrays
    setImages((prev) => prev.filter((_, i) => i !== index));

    // Revoke the URL to free up memory
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    // Validate current step fields before proceeding
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ["name", "description", "location"];
        break;
      case 1:
        fieldsToValidate = ["university", "distance_to_campus"];
        break;
      case 2:
        // No validation needed for amenities
        setCurrentStep((prev) => prev + 1);
        return;
      case 3:
        // Check if at least one image is uploaded
        if (images.length === 0) {
          toast.error("Please upload at least one image");
          return;
        }
        setCurrentStep((prev) => prev + 1);
        return;
      default:
        break;
    }

    const result = await trigger(fieldsToValidate as any);

    if (result) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: FormData) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createHostelAction({
        ...data,
        owner_id: userId,
        images,
      });

      if (result.success) {
        toast.success("Hostel created successfully!");
        router.push(`/owner/hostels/${result.hostelId}`);
      } else {
        throw new Error(result.error || "Failed to create hostel");
      }
    } catch (error: any) {
      toast.error(
        error.message || "An error occurred while creating the hostel"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step1"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                Hostel Name
              </Label>
              <Input
                id="name"
                placeholder="Enter hostel name"
                {...register("name")}
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your hostel, its features, and what makes it special"
                className={cn(
                  "min-h-32",
                  errors.description && "border-destructive"
                )}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-base">
                Location
              </Label>
              <div className="relative">
                <Input
                  id="location"
                  placeholder="e.g. East Legon, Near Starbites Restaurant"
                  className={cn(
                    "pl-10",
                    errors.location && "border-destructive"
                  )}
                  {...register("location")}
                />
                <MapPin className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            key="step2"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="university" className="text-base">
                Nearest University
              </Label>
              <div className="relative">
                <Controller
                  name="university"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger
                        className={cn(
                          "pl-10",
                          errors.university && "border-destructive"
                        )}
                      >
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
                  )}
                />
                <School className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
              </div>
              {errors.university && (
                <p className="text-sm text-destructive">
                  {errors.university.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance_to_campus" className="text-base">
                Distance to Campus
              </Label>
              <div className="relative">
                <Input
                  id="distance_to_campus"
                  placeholder="e.g. 5 min walk, 2 km"
                  className={cn(
                    "pl-10",
                    errors.distance_to_campus && "border-destructive"
                  )}
                  {...register("distance_to_campus")}
                />
                <Ruler className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
              {errors.distance_to_campus && (
                <p className="text-sm text-destructive">
                  {errors.distance_to_campus.message}
                </p>
              )}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step3"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <Label className="text-base">Amenities</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card
                className={cn(
                  "border-2 transition-all",
                  watch("amenities.wifi")
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                <CardContent className="pt-6 pb-6">
                  <Controller
                    name="amenities.wifi"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="wifi"
                            className="text-base font-medium flex items-center"
                          >
                            <Wifi className="h-5 w-5 mr-2 text-primary" /> WiFi
                            Internet
                          </Label>
                          <p className="text-muted-foreground text-sm mt-1">
                            High-speed internet access for residents
                          </p>
                        </div>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              <Card
                className={cn(
                  "border-2 transition-all",
                  watch("amenities.security")
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                <CardContent className="pt-6 pb-6">
                  <Controller
                    name="amenities.security"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="security"
                            className="text-base font-medium flex items-center"
                          >
                            <Shield className="h-5 w-5 mr-2 text-primary" />{" "}
                            24/7 Security
                          </Label>
                          <p className="text-muted-foreground text-sm mt-1">
                            Round-the-clock security personnel and systems
                          </p>
                        </div>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              <Card
                className={cn(
                  "border-2 transition-all",
                  watch("amenities.water")
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                <CardContent className="pt-6 pb-6">
                  <Controller
                    name="amenities.water"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="water"
                            className="text-base font-medium flex items-center"
                          >
                            <Droplets className="h-5 w-5 mr-2 text-primary" />{" "}
                            Constant Water
                          </Label>
                          <p className="text-muted-foreground text-sm mt-1">
                            Reliable water supply with backup systems
                          </p>
                        </div>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              <Card
                className={cn(
                  "border-2 transition-all",
                  watch("amenities.electricity")
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                <CardContent className="pt-6 pb-6">
                  <Controller
                    name="amenities.electricity"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="electricity"
                            className="text-base font-medium flex items-center"
                          >
                            <Zap className="h-5 w-5 mr-2 text-primary" /> Backup
                            Power
                          </Label>
                          <p className="text-muted-foreground text-sm mt-1">
                            Generator or solar backup during outages
                          </p>
                        </div>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              <Card
                className={cn(
                  "border-2 transition-all",
                  watch("amenities.study_room")
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                <CardContent className="pt-6 pb-6">
                  <Controller
                    name="amenities.study_room"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="study_room"
                            className="text-base font-medium flex items-center"
                          >
                            <BookOpen className="h-5 w-5 mr-2 text-primary" />{" "}
                            Study Room
                          </Label>
                          <p className="text-muted-foreground text-sm mt-1">
                            Dedicated quiet space for studying
                          </p>
                        </div>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              <Card
                className={cn(
                  "border-2 transition-all",
                  watch("amenities.kitchen")
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                <CardContent className="pt-6 pb-6">
                  <Controller
                    name="amenities.kitchen"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="kitchen"
                            className="text-base font-medium flex items-center"
                          >
                            <BookOpen className="h-5 w-5 mr-2 text-primary" />{" "}
                            Kitchen
                          </Label>
                          <p className="text-muted-foreground text-sm mt-1">
                            Shared or private kitchen facilities
                          </p>
                        </div>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step4"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label className="text-base">Hostel Images</Label>
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6 pb-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="mb-4">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Upload Hostel Images
                  </h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                    Upload clear, well-lit photos of your hostel. Include
                    exterior views, rooms, and common areas.
                  </p>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mx-auto"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Images
                  </Button>
                </CardContent>
              </Card>

              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-medium mb-3">
                    Selected Images
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-md overflow-hidden border bg-muted/40"
                      >
                        <Image
                          src={preview}
                          alt={`Preview ${index}`}
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
                      className="aspect-square rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <PlusCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step5"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review Your Information</h3>
                <p className="text-muted-foreground">
                  Please verify that all the information below is correct before
                  submitting.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{watchAllFields.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Basic Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium">
                              {watchAllFields.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {watchAllFields.description.substring(0, 100)}...
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{watchAllFields.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {
                              universities.find(
                                (uni) => uni.id === watchAllFields.university
                              )?.name
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <span>{watchAllFields.distance_to_campus}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Amenities
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(watchAllFields.amenities).map(
                          ([key, value]) =>
                            value ? (
                              <div
                                key={key}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span className="capitalize">
                                  {key.replace("_", " ")}
                                </span>
                              </div>
                            ) : null
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Images
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {imagePreviews.slice(0, 6).map((preview, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-md overflow-hidden bg-muted relative"
                        >
                          <Image
                            src={preview}
                            alt={`Preview ${index}`}
                            fill
                            className="object-cover"
                          />
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-primary/70 text-white text-[10px] px-1 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                      {imagePreviews.length > 6 && (
                        <div className="aspect-square rounded-md bg-muted/70 flex items-center justify-center text-sm">
                          +{imagePreviews.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-md">
      <CardHeader className="relative pb-0">
        <div className="absolute left-4 top-4">
          <Link href="/owner/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <CardTitle className="text-center pt-6">Add New Hostel</CardTitle>
        <CardDescription className="text-center">
          List your hostel on Hallynk to reach thousands of students
        </CardDescription>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mt-6 mb-2">
          <ul className="flex items-center gap-2">
            {steps.map((step, index) => (
              <li
                key={index}
                className={cn(
                  "flex-col items-center text-center hidden md:flex",
                  currentStep === index
                    ? "text-primary"
                    : currentStep > index
                    ? "text-primary/80"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-medium mb-1",
                    currentStep === index
                      ? "border-primary bg-primary/10"
                      : currentStep > index
                      ? "border-primary/80 bg-primary/5"
                      : "border-muted"
                  )}
                >
                  {currentStep > index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs hidden lg:block">{step.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center pt-3">
          <h2 className="font-medium text-lg">{steps[currentStep].title}</h2>
          <p className="text-muted-foreground text-sm">
            {steps[currentStep].description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {renderStepContent()}
        </form>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button type="button" onClick={nextStep}>
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Creating..." : "Create Hostel"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
