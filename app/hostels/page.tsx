import { createClient } from "@/lib/supabase/server"
import { HostelsList } from "@/components/hostels-list"
import { Tables } from "@/lib/supabase/database.types"

// type University = Tables<"universities">

export default async function HostelsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{
    university?: string
    location?: string
    minPrice?: string
    maxPrice?: string
    amenities?: string
    roomType?: string
    distance?: string
    sort?: string
    page?: string
  }>
}) {
  const supabase = await createClient()
  const searchParams = await searchParamsPromise

  // Parse search parameters
  const university = searchParams.university || ""
  const location = searchParams.location || ""
  const minPrice = Number.parseInt(searchParams.minPrice || "0")
  const maxPrice = Number.parseInt(searchParams.maxPrice || "10000")
  const amenities = searchParams.amenities ? searchParams.amenities.split(",") : []
  const roomType = searchParams.roomType || ""
  const distance = searchParams.distance || ""
  const sort = searchParams.sort || "recommended"
  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 9

  // Fetch universities for filter
  const { data: universities } = await supabase.from("universities").select("id, name").order("name")

  // Build the query
  let query = supabase
    .from("hostels")
    .select(
      `
      *,
      rooms!inner(*),
      hostel_images!inner(url, is_primary),
      reviews(*)
    `,
      { count: "exact" },
    )
    // .eq("verified", true)

  // Apply filters
  if (university) {
    query = query.eq("university", university)
  }

  if (location) {
    query = query.ilike("location", `%${location}%`)
  }

  // Filter by price range (using the rooms table)
  query = query.gte("rooms.price", minPrice).lte("rooms.price", maxPrice)

  // Filter by room type
  if (roomType) {
    query = query.eq("rooms.type", roomType)
  }

  // Filter by distance to campus
  if (distance) {
    // This would depend on how distance is stored in your database
    // For example, if you have a field like "distance_category"
    query = query.eq("distance_category", distance)
  }

  // Apply sorting
  switch (sort) {
    case "price-low":
      query = query.order("rooms.price", { ascending: true })
      break
    case "price-high":
      query = query.order("rooms.price", { ascending: false })
      break
    case "distance":
      query = query.order("distance_to_campus", { ascending: true })
      break
    default:
      // Default to recommended (could be a combination of factors)
      // If default sort is by rating, this will be handled in JS
      break
  }

  // Paginate
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: hostels, count, error } = await query.range(from, to)

  if (error) {
    console.error("Error fetching hostels:", error)
  }

  // Process the data to get the primary image for each hostel
  let processedHostels =
    hostels?.map((hostel) => {
      const primaryImage =
        hostel.hostel_images.find((img) => img.is_primary)?.url || hostel.hostel_images[0]?.url || "/placeholder.svg"

      const averageRating =
        hostel.reviews.length > 0
          ? hostel.reviews.reduce((acc, review) => acc + review.rating, 0) / hostel.reviews.length
          : 0

      const reviewCount = hostel.reviews.length

      return {
        ...hostel,
        primaryImage,
        rating: averageRating,
        reviews: reviewCount, // This now represents the count of review objects
        // Get the lowest price room
        lowestPrice: hostel.rooms.length > 0 ? Math.min(...hostel.rooms.map((room) => room.price)) : 0,
      }
    }) || []

  // Apply sorting for rating if selected, or default
  if (sort === "rating" || (sort === "recommended" && processedHostels.length > 0)) { // Assuming 'recommended' defaults to sorting by rating
    processedHostels.sort((a, b) => b.rating - a.rating); // Sort by descending rating
  }

  return (
    <HostelsList
      hostels={processedHostels}
      totalHostels={count || 0}
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
  )
}
