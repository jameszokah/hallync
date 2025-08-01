"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Shield,
  Wifi,
  Zap,
  Droplets,
  BookOpen,
  ChevronDown,
  ListFilter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Footer } from "@/components/footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HostelImages, HostelReviews, Hostels } from "@/app/generated/prisma";

interface University {
  id: string;
  name: string;
}

interface HostelWithExtras extends Hostels {
  id: string;
  name: string;
  description: string;
  location: string;
  verified: boolean;
  amenities: any;
  images: HostelImages[];
  reviews: number;
  lowestPrice: number;
  primaryImage: string;
  rating: number;
}

interface HostelsListProps {
  hostels: HostelWithExtras[];
  totalHostels: number;
  currentPage: number;
  pageSize: number;
  universities: University[];
  filters: {
    university: string;
    location: string;
    minPrice: number;
    maxPrice: number;
    amenities: string[];
    roomType: string;
    distance: string;
    sort: string;
  };
}

const AmenityIcon = ({ amenity }: { amenity: string }) => {
  const iconMap: { [key: string]: React.ElementType } = {
    wifi: Wifi,
    security: Shield,
    water: Droplets,
    electricity: Zap,
    // Add more as needed
  };
  const IconComponent =
    iconMap[amenity.toLowerCase().replace(/\\s+/g, "_")] || BookOpen;
  return <IconComponent className="h-4 w-4 mr-1.5 text-muted-foreground" />;
};

function Filters({
  universities,
  filters,
  onFilterChange,
  applyFilters,
  className,
}: {
  universities: University[];
  filters: HostelsListProps["filters"];
  onFilterChange: (newFilters: Partial<HostelsListProps["filters"]>) => void;
  applyFilters?: (newFilters: Partial<HostelsListProps["filters"]>) => void;
  className?: string;
}) {
  const [priceRange, setPriceRange] = useState<number[]>([
    filters.minPrice,
    filters.maxPrice,
  ]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    filters.amenities
  );
  const [roomType, setRoomType] = useState(filters.roomType);
  const [distance, setDistance] = useState(filters.distance);

  const handleAmenityChange = (
    amenity: string,
    checked: boolean | "indeterminate"
  ) => {
    const newAmenities = checked
      ? [...selectedAmenities, amenity]
      : selectedAmenities.filter((a) => a !== amenity);
    setSelectedAmenities(newAmenities);
    onFilterChange({ amenities: newAmenities });
  };

  const handlePriceChange = (newRange: number[]) => {
    setPriceRange(newRange);
    onFilterChange({ minPrice: newRange[0], maxPrice: newRange[1] });
  };

  const handleRoomTypeChange = (value: string) => {
    setRoomType(value);
    onFilterChange({ roomType: value === "all" ? "" : value });
  };

  const handleDistanceChange = (value: string) => {
    setDistance(value);
    onFilterChange({ distance: value === "all" ? "" : value });
  };

  const handleApplyFilters = () => {
    const currentFilters = {
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      amenities: selectedAmenities,
      roomType: roomType === "all" ? "" : roomType,
      distance: distance === "all" ? "" : distance,
    };

    if (applyFilters) {
      applyFilters(currentFilters);
    }
  };

  return (
    <aside
      className={`w-full md:w-72 lg:w-80 p-6 bg-background border-r ${className}`}
    >
      <h2 className="text-xl font-semibold mb-6">Filters</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3 text-sm">
            Price Range (₵ per semester)
          </h3>
          <Slider
            value={priceRange}
            min={0}
            max={10000}
            step={500}
            onValueChange={handlePriceChange}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₵{priceRange[0].toLocaleString()}</span>
            <span>₵{priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue="amenities"
          className="w-full"
        >
          <AccordionItem value="amenities">
            <AccordionTrigger className="text-sm font-medium">
              Amenities
            </AccordionTrigger>
            <AccordionContent className="pt-2 space-y-2">
              {[
                { id: "wifi", label: "WiFi", icon: Wifi },
                { id: "security", label: "24/7 Security", icon: Shield },
                { id: "water", label: "Constant Water", icon: Droplets },
                { id: "electricity", label: "Reliable Power", icon: Zap },
                // Add more amenities as needed
              ].map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.id}
                    checked={selectedAmenities.includes(amenity.id)}
                    onCheckedChange={(checked) =>
                      handleAmenityChange(amenity.id, checked)
                    }
                  />
                  <label
                    htmlFor={amenity.id}
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    <amenity.icon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />{" "}
                    {amenity.label}
                  </label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="distance">
            <AccordionTrigger className="text-sm font-medium">
              Distance from Campus
            </AccordionTrigger>
            <AccordionContent className="pt-2 space-y-2">
              <Select
                value={distance || "all"}
                onValueChange={handleDistanceChange}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Distances
                  </SelectItem>
                  <SelectItem value="0-5" className="text-xs">
                    <span className="font-medium">0-5 km</span>
                  </SelectItem>
                  <SelectItem value="5-10" className="text-xs">
                    <span className="font-medium">5-10 km</span>
                  </SelectItem>
                  <SelectItem value="10-15" className="text-xs">
                    <span className="font-medium">10-15 km</span>
                  </SelectItem>
                  <SelectItem value="15-20" className="text-xs">
                    <span className="font-medium">15-20 km</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div>
          <h3 className="font-medium mb-2 text-sm">Room Type</h3>
          <Select
            value={roomType || "all"}
            onValueChange={handleRoomTypeChange}
          >
            <SelectTrigger className="w-full text-xs">
              <SelectValue placeholder="Select Room Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Types
              </SelectItem>
              <SelectItem value="single" className="text-xs">
                Single Room
              </SelectItem>
              <SelectItem value="double" className="text-xs">
                Double Room
              </SelectItem>
              <SelectItem value="shared" className="text-xs">
                Shared Room (3+ beds)
              </SelectItem>
              {/* Add more room types */}
            </SelectContent>
          </Select>
        </div>

        {/* University filter can be added here if needed, though it's in the header currently */}
        {/* <div>
          <h3 className="font-medium mb-2 text-sm">University</h3>
          <Select value={filters.university || "all"} onValueChange={(value) => onFilterChange({ university: value === "all" ? "" : value })}>
            <SelectTrigger className="w-full text-xs">
              <SelectValue placeholder="Select University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Universities</SelectItem>
              {universities.map((uni) => (
                <SelectItem key={uni.id} value={uni.id} className="text-xs">
                  {uni.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

        <Button onClick={handleApplyFilters} className="w-full mt-4">
          Apply Filters
        </Button>
      </div>
    </aside>
  );
}

function HostelCard({ hostel }: { hostel: HostelWithExtras }) {
  return (
    <Card className="group overflow-hidden border border-border/40 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full rounded-xl">
      <Link
        href={`/hostels/${hostel.id}`}
        className="relative block overflow-hidden"
      >
        <div className="relative w-full h-52 md:h-60 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          <Image
            src={hostel.images[0]?.url || "/placeholder.svg"}
            alt={hostel.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-700 ease-out group-hover:scale-110 z-0"
          />
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
            <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-0.5" />
              <span className="text-xs font-semibold">
                {hostel.rating.toFixed(1)}
              </span>
            </div>
            {hostel.verified && (
              <Badge
                variant="secondary"
                className="bg-green-600/90 backdrop-blur-sm text-white shadow-sm text-[10px] h-6 px-2"
              >
                <Shield className="h-3 w-3 mr-0.5" />
                Verified
              </Badge>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
            <div className="flex gap-1.5 flex-wrap">
              {hostel.amenities &&
                Array.isArray(JSON.parse(JSON.stringify(hostel.amenities))) &&
                JSON.parse(JSON.stringify(hostel.amenities))
                  .slice(0, 3)
                  .map((amenity: any) => (
                    <Badge
                      key={amenity?.toString() || ""}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 font-medium bg-white/80 backdrop-blur-sm text-black border-none shadow-sm"
                    >
                      <AmenityIcon amenity={amenity?.toString() || ""} />
                      {amenity
                        ?.toString()
                        ?.split("_")
                        .map(
                          (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
                        )
                        .join(" ")}
                    </Badge>
                  ))}
              {hostel.amenities &&
                Array.isArray(JSON.parse(JSON.stringify(hostel.amenities))) &&
                JSON.parse(JSON.stringify(hostel.amenities)).length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 font-medium bg-white/80 backdrop-blur-sm border-none shadow-sm"
                  >
                    +{JSON.parse(JSON.stringify(hostel.amenities)).length - 3}{" "}
                    more
                  </Badge>
                )}
            </div>
          </div>
        </div>
      </Link>

      <CardHeader className="p-4 flex-grow">
        <div className="flex items-center justify-between">
          <Link href={`/hostels/${hostel.id}`} className="block w-full">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
              {hostel.name}
            </CardTitle>
          </Link>
        </div>
        <CardDescription className="text-xs text-muted-foreground flex items-center mt-1.5 line-clamp-1">
          <MapPin className="h-3 w-3 flex-shrink-0 mr-1" />
          <span className="truncate">{hostel.location}</span>
        </CardDescription>
        <div className="flex items-center mt-3 text-xs text-muted-foreground">
          <span className="truncate">({hostel.reviews} reviews)</span>
          <span className="mx-1.5">•</span>
          <span className="truncate">Student Choice</span>
        </div>
      </CardHeader>

      <CardFooter className="p-4 pt-0 border-t mt-auto">
        <div className="flex justify-between items-center w-full">
          <div className="group-hover:translate-y-[-2px] transition-transform duration-300">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              Starting from
            </p>
            <div className="flex items-baseline">
              <p className="text-xl font-bold text-primary">
                ₵{hostel.lowestPrice.toLocaleString()}
              </p>
              <span className="text-xs text-muted-foreground ml-1">
                /semester
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="rounded-full px-4 shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow group-hover:scale-[1.02]"
          >
            <Link
              href={`/hostels/${hostel.id}`}
              className="flex items-center gap-1"
            >
              View Details
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function HostelsList({
  hostels,
  totalHostels,
  currentPage,
  pageSize,
  universities,
  filters: initialFilters,
}: HostelsListProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [currentFilters, setCurrentFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState(initialFilters.location || ""); // Initialize with location from filters
  const [sortOption, setSortOption] = useState(
    initialFilters.sort || "recommended"
  );
  const [university, setUniversity] = useState(initialFilters.university);
  const [open, setOpen] = useState(false);
  const totalPages = Math.ceil(totalHostels / pageSize);

  const updateUrlParams = (
    newFilters: Partial<HostelsListProps["filters"]>,
    newSort?: string,
    newPage?: number
  ) => {
    const params = new URLSearchParams();

    const mergedFilters = { ...currentFilters, ...newFilters };

    if (mergedFilters.university)
      params.set("university", mergedFilters.university);
    if (mergedFilters.location) params.set("location", mergedFilters.location); // Use location from mergedFilters
    if (mergedFilters.minPrice > 0)
      params.set("minPrice", mergedFilters.minPrice.toString());
    if (mergedFilters.maxPrice < 10000)
      params.set("maxPrice", mergedFilters.maxPrice.toString());
    if (mergedFilters.amenities && mergedFilters.amenities.length > 0) {
      params.set("amenities", mergedFilters.amenities.join(","));
    }
    if (mergedFilters.roomType) params.set("roomType", mergedFilters.roomType);
    if (mergedFilters.distance) params.set("distance", mergedFilters.distance);

    const sortToUse = newSort || sortOption;
    if (sortToUse) params.set("sort", sortToUse);

    const pageToUse = newPage || 1; // Reset to first page if filters change and no specific page given
    params.set("page", pageToUse.toString());

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (
    newFilters: Partial<HostelsListProps["filters"]>
  ) => {
    const updatedFullFilters = { ...currentFilters, ...newFilters };
    setCurrentFilters(updatedFullFilters);
    setOpen(false);
    // Apply immediately or wait for a button click? For now, let's assume an "Apply Filters" button in the Filters component
    // For instant application: updateUrlParams(newFilters);
  };

  const applyAllFilters = (
    newFilters: Partial<HostelsListProps["filters"]>
  ) => {
    updateUrlParams(newFilters); // Pass empty to use currentFilters state
    setOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...currentFilters, location: searchQuery };
    setCurrentFilters(newFilters);
    updateUrlParams({ location: searchQuery });
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    updateUrlParams({}, value);
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({}, undefined, page);
  };

  const handleUniversityChange = (value: string) => {
    const newUni = value === "all" ? "" : value;
    setUniversity(newUni);
    const newFilters = { ...currentFilters, university: newUni };
    setCurrentFilters(newFilters);
    updateUrlParams({ university: newUni });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    // Simplified pagination, full implementation can be more complex
    return (
      <Pagination className="mt-12">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
            />
          )}
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            } else if (
              (pageNum === currentPage - 2 && currentPage > 3) ||
              (pageNum === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              return <PaginationEllipsis key={`ellipsis-${pageNum}`} />;
            }
            return null;
          })}
          {currentPage < totalPages && (
            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      {/* Header Section */}
      <header className="sticky top-0 z-30 border-b bg-primary/95 backdrop-blur-sm shadow-sm transition-all duration-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex items-center w-full md:w-auto justify-between gap-4 flex-shrink-0">
              <Link
                href="/"
                className="font-bold text-xl text-white flex items-center gap-2"
              >
                <Image
                  src="/logo.svg"
                  alt="Hallynk"
                  width={100}
                  height={100}
                  className="w-14 h-14"
                />
              </Link>

              {/* Mobile Filter Trigger */}
              <div className="flex items-center gap-2 md:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ListFilter className="h-4 w-4" />
                      <span className="text-xs">Filters</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full max-w-xs sm:max-w-sm"
                  >
                    <SheetHeader>
                      <SheetTitle>Filter Hostels</SheetTitle>
                    </SheetHeader>
                    <Filters
                      universities={universities}
                      filters={currentFilters}
                      onFilterChange={(newPartialFilters) => {
                        // In sheet, filters are applied via the button inside Filters component
                        // So, just update the state here.
                        const updated = {
                          ...currentFilters,
                          ...newPartialFilters,
                        };
                        setCurrentFilters(updated);
                      }}
                      applyFilters={applyAllFilters}
                      className="border-r-0 p-0" // Remove border and padding for sheet
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="flex-grow w-full md:max-w-md my-2 md:my-0">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by location, hostel name..."
                  className="pl-10 w-full text-sm border-primary/20 focus:border-primary/40 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end md:ml-auto">
              <Select
                value={university || "all"}
                onValueChange={handleUniversityChange}
              >
                <SelectTrigger className="w-full sm:w-40 text-sm rounded-lg">
                  <SelectValue placeholder="Select University" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm">
                    All Universities
                  </SelectItem>
                  {universities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id} className="text-sm">
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm rounded-lg"
                  >
                    <span className="hidden sm:inline-block mr-1">
                      Sort by:
                    </span>
                    <span className="font-medium">
                      {sortOption.replace("-", " ")}
                    </span>
                    <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {[
                    { value: "recommended", label: "Recommended" },
                    { value: "price-low", label: "Price: Low to High" },
                    { value: "price-high", label: "Price: High to Low" },
                    { value: "rating", label: "Rating" },
                  ].map((item) => (
                    <DropdownMenuItem
                      key={item.value}
                      onSelect={() => handleSortChange(item.value)}
                      className="text-sm"
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Desktop Filters (Hidden on Mobile) */}
          <Filters
            universities={universities}
            filters={currentFilters}
            onFilterChange={handleFilterChange} // This updates state
            applyFilters={applyAllFilters} // This is the function to call when "Apply Filters" is clicked
            className="hidden md:block" // Hide on mobile, show on md+
          />

          {/* Hostels Grid */}
          <main className="flex-1">
            {hostels.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {hostels.length} of {totalHostels} hostels
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {hostels.map((hostel) => (
                    <HostelCard key={hostel.id} hostel={hostel} />
                  ))}
                </div>
                {renderPagination()}
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-3">
                  No Hostels Found
                </h2>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or searching for a different
                  location.
                </p>
                <Button onClick={() => router.push(pathname)}>
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
