import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { HostelDetails } from "@/components/hostel-details"
import prisma from "@/lib/prisma"

export default async function HostelDetailPage({ params }: { params: Promise<{ id: string }> }) {

  const hostelId = (await params).id

  if (!hostelId) {
    notFound()
  }

  const hostel = await prisma.hostels.findUnique({
    where: {
      id: hostelId,
    },
    include: {
      rooms: true,
      images: true,
      reviews: true,
      owner: true,
    },
  })

  console.log(hostel, 'hostel')

  if (!hostel) {
    console.log("Hostel not found")
    notFound()
  }

  const university = await prisma.university.findUnique({
    where: {
      id: hostel.university,
    },
  })

  console.log(university, 'university')
  

  // if (!university) {
  //   console.log("University not found")
  //   notFound()
  // }

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
  const sortedImages = [...hostel.images].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return 0
  })

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

