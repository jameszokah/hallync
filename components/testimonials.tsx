import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Testimonials() {
  const testimonials = [
    {
      name: "Kofi Mensah",
      university: "University of Ghana",
      image:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      text: "Hallynk saved me so much time and stress. I found an affordable hostel near campus without having to physically visit multiple locations.",
      rating: 5,
    },
    {
      name: "Ama Darko",
      university: "KNUST",
      image:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      text: "As a first-year student from a different region, I was worried about finding accommodation. Hallynk made it easy to find a safe, verified hostel.",
      rating: 5,
    },
    {
      name: "Emmanuel Owusu",
      university: "University of Cape Coast",
      image:
        "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      text: "The verified reviews helped me choose a hostel with reliable internet, which was essential for my online classes. Highly recommend!",
      rating: 4,
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          What Students Say
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Hear from students who found their perfect accommodation through
          Hallynk
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="mb-6 text-muted-foreground">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                  />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.university}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
