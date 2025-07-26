import { HostelsList } from "@/components/hostels-list";
import prisma from "@/lib/prisma";
import {
  HostelImages,
  HostelReviews,
  Hostels,
  Room,
} from "../generated/prisma";

// type University = Tables<"universities">

export default async function HostelsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{
    university?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    amenities?: string;
    roomType?: string;
    distance?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const searchParams = await searchParamsPromise;

  // Parse search parameters
  const university = searchParams.university || "";
  const location = searchParams.location || "";
  const minPrice = Number.parseInt(searchParams.minPrice || "0");
  const maxPrice = Number.parseInt(searchParams.maxPrice || "10000");
  const amenities = searchParams.amenities
    ? searchParams.amenities.split(",")
    : [];
  const roomType = searchParams.roomType || "";
  const distance = searchParams.distance || "";
  const sort = searchParams.sort || "recommended";
  const page = Number.parseInt(searchParams.page || "1");
  const pageSize = 9;

  // Fetch universities for filter
  const universities = await prisma.university.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Initial hostel query
  let hostelsQuery = await prisma.hostels.findMany({
    include: {
      rooms: true,
      images: true,
      reviews: true,
    },
  });

 

  // Apply filters
  if (university) {
    const universityQuery = await prisma.university.findFirst({
      where: {
        name: university,
      },
    });

    hostelsQuery = await prisma.hostels.findMany({
      where: {
        university: universityQuery?.name,
      },
      include: {
        rooms: true,
        images: true,
        reviews: true,
      },
    });
  }

  if (location) {
    hostelsQuery = await prisma.hostels.findMany({
      where: {
        name: {
          contains: location,
        },
        location: {
          contains: location,
        },
      },
      include: {
        rooms: true,
        images: true,
        reviews: true,
      },
    });
  }

  // Filter by room type
  if (roomType) {
    hostelsQuery = await prisma.hostels.findMany({
      where: {
        rooms: {
          some: {
            type: roomType,
          },
        },
      },
      include: {
        rooms: true,
        images: true,
        reviews: true,
      },
    });
  }

  // Filter by distance to campus
  if (distance) {
    hostelsQuery = await prisma.hostels.findMany({
      where: {
        distance_to_campus: distance,
      },
      include: {
        rooms: true,
        images: true,
        reviews: true,
      },
    });
  }

  // Apply sorting
  switch (sort) {
    case "price-low":
      hostelsQuery = await prisma.hostels.findMany({
        orderBy: {
          rooms: {
            _count: "asc",
          },
        },
        include: {
          rooms: true,
          images: true,
          reviews: true,
        },
      });
      break;
    case "price-high":
      hostelsQuery = await prisma.hostels.findMany({
        orderBy: {
          rooms: {
            _count: "desc",
          },
        },
        include: {
          rooms: true,
          images: true,
          reviews: true,
        },
      });
      break;
    case "distance":
      hostelsQuery = await prisma.hostels.findMany({
        orderBy: {
          distance_to_campus: "asc",
        },
        include: {
          rooms: true,
          images: true,
          reviews: true,
        },
      });
      break;
    default:
      // Default to recommended (could be a combination of factors)
      // If default sort is by rating, this will be handled in JS
      break;
  }

  // Paginate the results manually
  const totalHostelsCount = hostelsQuery.length;
  const from = (page - 1) * pageSize;
  const to = Math.min(from + pageSize, totalHostelsCount);
  const paginatedHostels = hostelsQuery.slice(from, to);

  // Process the data to get the primary image for each hostel
  const processedHostels =
    paginatedHostels.map((hostel) => {
      const primaryImage =
        hostel.images.find((img) => img.is_primary)?.url ||
        hostel.images[0]?.url ||
        "/placeholder.svg";

      const averageRating =
        hostel.reviews.length > 0
          ? hostel.reviews.reduce((acc, review) => acc + review.rating, 0) /
            hostel.reviews.length
          : 0;

      const reviewCount = hostel.reviews.length;

      return {
        ...hostel,
        primaryImage,
        rating: averageRating,
        reviews: reviewCount, // This now represents the count of review objects
        // Get the lowest price room
        lowestPrice:
          hostel.rooms.length > 0
            ? Math.min(...hostel.rooms.map((room) => room.price))
            : 0,
      };
    }) || [];

  // Apply sorting for rating if selected, or default
  if (
    sort === "rating" ||
    (sort === "recommended" && processedHostels.length > 0)
  ) {
    // Assuming 'recommended' defaults to sorting by rating
    processedHostels.sort((a, b) => b.rating - a.rating); // Sort by descending rating
  }

  return (
    <HostelsList
      hostels={processedHostels}
      totalHostels={totalHostelsCount}
      currentPage={page}
      pageSize={pageSize}
      universities={universities || []}
      filters={{
        university,
        location,
        minPrice,
        maxPrice,
        amenities,
        roomType,
        distance,
        sort,
      }}
    />
  );
}
