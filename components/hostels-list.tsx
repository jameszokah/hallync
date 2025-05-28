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

interface Hostel {
  id: string;
  name: string;
  location: string;
  university: string;
  verified: boolean;
  primaryImage: string;
  rating: number;
  reviews: number;
  lowestPrice: number;
  amenities: string[];
}

interface University {
  id: string;
  name: string;
}

interface HostelsListProps {
  hostels: Hostel[];
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
  className,
}: {
  universities: University[];
  filters: HostelsListProps["filters"];
  onFilterChange: (newFilters: Partial<HostelsListProps["filters"]>) => void;
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
  // const [distance, setDistance] = useState(filters.distance); // Assuming distance filter might be added later

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

        <Button onClick={() => onFilterChange({})} className="w-full mt-4">
          Apply Filters
        </Button>
      </div>
    </aside>
  );
}

function HostelCard({ hostel }: { hostel: Hostel }) {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <Link href={`/hostels/${hostel.id}`} className="block">
        <div className="relative w-full h-48 md:h-56">
          <Image
            src={hostel.primaryImage || "/placeholder.svg"}
            alt={hostel.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          {hostel.verified && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-green-500 text-white"
            >
              Verified
            </Badge>
          )}
        </div>
      </Link>
      <CardHeader className="p-4 flex-grow">
        <Link href={`/hostels/${hostel.id}`} className="block">
          <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
            {hostel.name}
          </CardTitle>
        </Link>
        <CardDescription className="text-xs text-muted-foreground flex items-center mt-1">
          <MapPin className="h-3.5 w-3.5 mr-1" /> {hostel.location}
        </CardDescription>
        <div className="flex items-center mt-2">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="text-sm font-medium">
            {hostel.rating > 0 ? hostel.rating.toFixed(1) : "New"}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            ({hostel.reviews} reviews)
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Array.isArray(hostel.amenities) &&
            hostel.amenities.slice(0, 3).map((amenity) => (
              <Badge
                key={amenity}
                variant="outline"
                className="text-xs px-1.5 py-0.5 font-normal"
              >
                <AmenityIcon amenity={amenity} />
                {amenity
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </Badge>
            ))}
          {Array.isArray(hostel.amenities) && hostel.amenities.length > 3 && (
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0.5 font-normal"
            >
              +{hostel.amenities.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t mt-auto">
        <div className="flex justify-between items-center w-full">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="text-lg font-bold text-primary">
              ₵{hostel.lowestPrice.toLocaleString()}
            </p>
          </div>
          <Button asChild size="sm">
            <Link href={`/hostels/${hostel.id}`}>View Details</Link>
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
    // if (mergedFilters.distance) params.set("distance", mergedFilters.distance);

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
    // Apply immediately or wait for a button click? For now, let's assume an "Apply Filters" button in the Filters component
    // For instant application: updateUrlParams(newFilters);
  };

  const applyAllFilters = () => {
    updateUrlParams({}); // Pass empty to use currentFilters state
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
      <header className="sticky top-0 z-30 border-b bg-background shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center w-full justify-between gap-4 flex-shrink-0">
              <Link href="/" className="font-bold text-xl">
                Hallynk
              </Link>
              {/* Mobile Filter Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <ListFilter className="h-5 w-5" />
                    <span className="sr-only">Open Filters</span>
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
                    className="border-r-0 p-0" // Remove border and padding for sheet
                  />
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex-grow w-full sm:w-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="relative w-full max-w-md mx-auto sm:mx-0"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by location, hostel name..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Select
                value={university || "all"}
                onValueChange={handleUniversityChange}
              >
                <SelectTrigger className="w-full sm:w-48 text-sm">
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
                    className="w-full sm:w-auto text-sm"
                  >
                    Sort by: {sortOption.replace("-", " ")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
            // applyFilters={applyAllFilters} // This is the function to call when "Apply Filters" is clicked
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
