import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { HostelDetails } from "@/components/hostel-details"

export default async function HostelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const hostelId = (await params).id

  // Fetch the hostel details
  const { data: hostel, error } = await supabase
    .from("hostels")
    .select(`
      *,
      rooms(*),
      hostel_images(id, url, is_primary),
      reviews(id, user_id, rating, comment, helpful_count, created_at, users:user_id(first_name, last_name, email, university)),
      owner:owner_id(id, email, first_name, last_name, phone)
    `)
    .eq("id", hostelId)
    .single()

  if (error || !hostel) {
    console.error("Error fetching hostel:", error)
    notFound()
  }

  // Get the university name
  const { data: university } = await supabase.from("universities").select("name").eq("id", hostel.university).single()

  // Calculate average rating
  const totalRatings = hostel.reviews.length
  const ratingSum = hostel.reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = hostel.reviews.filter((review) => Math.floor(review.rating) === stars).length
    const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0
    return { stars, percentage, count }
  })

  // Sort images to put primary first
  const sortedImages = [...hostel.hostel_images].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return 0
  })

  // Track the view if user is authenticated
  const {
    data: { session },
  } = await supabase?.auth?.getSession()

  if (session) {
    // Record the view in hostel_views table
    await supabase.from("hostel_views").upsert(
      {
        user_id: session.user.id,
        hostel_id: hostelId,
        viewed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id, hostel_id",
        ignoreDuplicates: false,
      },
    )
  }

  // Format the hostel data for the component
  const hostelData = {
    ...hostel,
    university: university?.name || hostel.university,
    images: sortedImages.map((img) => img.url),
    rating: averageRating,
    totalReviews: totalRatings,
    ratingDistribution,
  }

  return <HostelDetails hostel={hostelData} />
}
