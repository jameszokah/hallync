import { Star } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export function HostelReviews({ hostelId }: { hostelId: string }) {
  // This would normally come from an API call using the hostelId
  const reviews = [
    {
      id: 1,
      user: {
        name: "Kofi Mensah",
        image: "/placeholder.svg?height=100&width=100",
        university: "University of Ghana",
        program: "Computer Science",
      },
      rating: 5,
      date: "August 2024",
      comment:
        "I stayed at this hostel for two semesters and had a great experience. The location is perfect, just a short walk to campus. The WiFi is reliable and the security is excellent. The management is responsive and addresses issues promptly.",
      helpful: 12,
    },
    {
      id: 2,
      user: {
        name: "Ama Darko",
        image: "/placeholder.svg?height=100&width=100",
        university: "University of Ghana",
        program: "Business Administration",
      },
      rating: 4,
      date: "July 2024",
      comment:
        "The hostel is clean and well-maintained. The only issue I had was with water supply occasionally, but it was usually resolved within a few hours. The study room is a great place to prepare for exams away from distractions.",
      helpful: 8,
    },
    {
      id: 3,
      user: {
        name: "Emmanuel Owusu",
        image: "/placeholder.svg?height=100&width=100",
        university: "University of Ghana",
        program: "Engineering",
      },
      rating: 5,
      date: "June 2024",
      comment:
        "Best hostel near UG! The backup generator was a lifesaver during power outages, and the security team is vigilant. The rooms are spacious and well-ventilated. Highly recommend for any student looking for quality accommodation.",
      helpful: 15,
    },
  ]

  const ratingStats = {
    average: 4.7,
    total: 124,
    distribution: [
      { stars: 5, percentage: 80, count: 99 },
      { stars: 4, percentage: 15, count: 19 },
      { stars: 3, percentage: 3, count: 4 },
      { stars: 2, percentage: 1, count: 1 },
      { stars: 1, percentage: 1, count: 1 },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="bg-background border rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold">{ratingStats.average}</div>
              <div className="flex justify-center md:justify-start mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(ratingStats.average) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
                  />
                ))}
              </div>
              <div className="text-muted-foreground mt-1">{ratingStats.total} reviews</div>
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="space-y-2">
              {ratingStats.distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <div className="w-12 text-sm">{item.stars} stars</div>
                  <Progress value={item.percentage} className="h-2" />
                  <div className="w-12 text-sm text-right">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={review.user.image || "/placeholder.svg"} alt={review.user.name} />
                <AvatarFallback>
                  {review.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-semibold">{review.user.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {review.user.university} • {review.user.program}
                    </p>
                  </div>
                  <div className="mt-1 sm:mt-0 text-sm text-muted-foreground">{review.date}</div>
                </div>

                <div className="flex mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
                    />
                  ))}
                </div>

                <p className="mt-3">{review.comment}</p>

                <div className="mt-4 flex items-center">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    Helpful ({review.helpful})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full">
        Load More Reviews
      </Button>
    </div>
  )
}
