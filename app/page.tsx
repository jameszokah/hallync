import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { HeroSection } from "@/components/hero-section";
import { FeaturedHostels, IHostel } from "@/components/featured-hostels";
import { HowItWorks } from "@/components/how-it-works";
import { Testimonials } from "@/components/testimonials";
import { UniversityPartners } from "@/components/university-partners";
import { Footer } from "@/components/footer";
import prisma from "@/lib/prisma";
import { Hostels, University } from "./generated/prisma";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedUniversityList } from "@/components/animated-university-list";

export default async function Home() {
  let featuredHostels: IHostel[] = [];
  let universities: University[] = [];

  try {
    const hostels = await prisma.hostels.findMany({
      where: {
        verified: true,
        featured: true,
      },
      include: {
        images: true,
        reviews: true,
        rooms: true,
      },
      take: 3,
    });

    const hostelsWithUniversity = await Promise.all(hostels.map(async (hostel) => {
      const university = await prisma.university.findUnique({
        where: {
          id: hostel.university,
        },
      });
      return {
        ...hostel,
        university: university,
      };
    }));

    featuredHostels = hostelsWithUniversity.map((hostel) => ({
      ...hostel,
      id: hostel.id,
      name: hostel.name,
      location: hostel.location,
      university: hostel.university,
      verified: hostel.verified,
      image: hostel.images[0]?.url || "/placeholder.svg",
      rating: Number(((hostel.reviews.length > 0
          ? hostel.reviews.reduce((acc, review) => acc + review.rating, 0) /
            hostel.reviews.length
          : 0)).toFixed(1)),
      reviews: hostel.reviews.length || 0,
      price: hostel.rooms[0]?.price || 0,
      priceUnit: "semester",
      amenities: Object.entries(hostel.amenities || {}).map(([key]) => key),
    }));

    universities = await prisma.university.findMany({
      take: 6,
    });
  } catch (error) {
    console.error("Database error:", error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HeroSection universities={universities} />

      <AnimatedSection className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Find Your Perfect Student Hostel
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Browse through verified hostels near your university, compare
            prices, and book securely.
          </p>
        </div>
        <FeaturedHostels hostels={featuredHostels} />
      </AnimatedSection>

      <HowItWorks />

      <AnimatedSection className="bg-muted py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">
              Popular Universities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Find hostels near Ghana's top universities
            </p>
          </div>
          <AnimatedUniversityList universities={universities} />
        </div>
      </AnimatedSection>

      <Testimonials />

      <UniversityPartners universities={universities} />

      <Footer />
    </div>
  );
}
