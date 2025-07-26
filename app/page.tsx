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

// Mock data to use when tables don't exist
// const MOCK_HOSTELS = [
//   {
//     id: "1",
//     name: "Legon Hall Annex",
//     location: "East Legon, Accra",
//     university: "University of Ghana",
//     verified: true,
//     image: "/placeholder.svg?height=300&width=400&text=Legon+Hall+Annex",
//     rating: 4.5,
//     reviews: 32,
//     price: 3500,
//     priceUnit: "semester",
//     amenities: ["WiFi", "Security", "Water", "Electricity"],
//   },
//   {
//     id: "2",
//     name: "Unity Hall",
//     location: "Ayeduase, Kumasi",
//     university: "Kwame Nkrumah University",
//     verified: true,
//     image: "/placeholder.svg?height=300&width=400&text=Unity+Hall",
//     rating: 4.2,
//     reviews: 28,
//     price: 2800,
//     priceUnit: "semester",
//     amenities: ["WiFi", "Security", "Water"],
//   },
//   {
//     id: "3",
//     name: "Atlantic Hostel",
//     location: "Cape Coast",
//     university: "University of Cape Coast",
//     verified: true,
//     image: "/placeholder.svg?height=300&width=400&text=Atlantic+Hostel",
//     rating: 4.0,
//     reviews: 15,
//     price: 2500,
//     priceUnit: "semester",
//     amenities: ["WiFi", "Security"],
//   },
// ];

const MOCK_UNIVERSITIES = [
  {
    id: "1",
    name: "University of Ghana",
    location: "Legon, Accra",
    image: "/ug.jpg",
  },
  {
    id: "2",
    name: "Kwame Nkrumah University",
    location: "Kumasi",
    image: "/knust.webp",
  },
  {
    id: "3",
    name: "University of Cape Coast",
    location: "Cape Coast",
    image: "/ucc.jpg",
  },
];

export default async function Home() {
  let featuredHostels: IHostel[] = [];
  let universities: University[] = [];

  try {
    // Check if the hostels table exists by attempting to query it
    const hostels = await prisma.hostels.findMany({
      where: {
        verified: true,
        featured: true,
      },
      include: {
        images: true,
      },
      take: 3,
    });

    // If the table exists, fetch the real data

    // Process the real hostel data
    featuredHostels = hostels.map((hostel) => ({
      ...hostel, // Include all the base Hostels fields
      id: hostel.id,
      name: hostel.name,
      location: hostel.location,
      university: hostel.university,
      verified: hostel.verified,
      image: hostel.images[0]?.url || "/placeholder.svg",
      rating: Number((Math.random() * 2 + 3).toFixed(1)), // Random rating between 3 and 5
      reviews: Math.floor(Math.random() * 30) + 5, // Random number of reviews
      price: Math.floor(Math.random() * 3000) + 2000, // Random price
      priceUnit: "semester",
      amenities: ["WiFi", "Security", "Water", "Electricity"].slice(
        0,
        Math.floor(Math.random() * 4) + 1
      ),
    }));

    // Check if the universities table exists
    universities = await prisma.university.findMany({
      take: 3,
    });

    // // If the table exists, fetch the real data
    //   universities = universities.map((university) => ({
    //   id: university.id,
    //   name: university.name,
    //   location: university.location,
    // }))
  } catch (error) {
    console.error("Unexpected error:", error);
    // Fallback to mock data in case of any unexpected errors
    // featuredHostels = MOCK_HOSTELS
    // universities = MOCK_UNIVERSITIES
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection universities={universities} />

      <section className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Find Your Perfect Student Hostel
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through verified hostels near your university, compare
            prices, and book securely.
          </p>
        </div>

        <FeaturedHostels hostels={featuredHostels} />
      </section>

      <HowItWorks />

      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Popular Universities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find hostels near Ghana's top universities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_UNIVERSITIES.map((university) => (
              <Link
                // href={`/hostels?university=${encodeURIComponent(
                //   university.id
                // )}`}
                href={'#'}
                key={university.id}
                className="bg-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={university.image}
                    alt={university.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{university.name}</h3>
                  <p className="text-muted-foreground">{university.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <UniversityPartners universities={universities} />

      <Footer />
    </div>
  );
}
