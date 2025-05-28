import {
  Building,
  Users,
  Lightbulb,
  Target,
  ShieldCheck,
  ThumbsUp,
  HeartHandshake,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header Placeholder - Assuming a global header/navbar exists */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Hallynk
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/hostels" className="text-sm hover:text-primary">
              Browse Hostels
            </Link>
            <Link href="/about" className="text-sm text-primary font-semibold">
              About Us
            </Link>
            <Link href="/contact" className="text-sm hover:text-primary">
              Contact Us
            </Link>
            {/* Add other nav links as needed */}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Building className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Hallynk</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Connecting students with safe, comfortable, and affordable hostels
            across Ghana. We are committed to simplifying your student
            accommodation journey.
          </p>
        </section>

        {/* Mission and Vision Section */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To provide a seamless and trustworthy platform for students to
                find and book quality hostels, ensuring a comfortable and
                conducive living environment that supports their academic
                pursuits. We aim to empower both students and hostel owners
                through technology and dedicated support.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Lightbulb className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To be the leading student accommodation platform in Africa,
                recognized for our innovation, reliability, and commitment to
                enhancing the student living experience. We envision a future
                where every student has access to safe and suitable housing.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Our Story Section */}
        <section className="mb-16">
          <Card className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <Image
                  src="/placeholder.svg?height=400&width=600&text=Our+Journey" // Replace with an actual image
                  alt="Hallynk Story"
                  width={600}
                  height={400}
                  className="object-cover h-full w-full"
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
                <p className="text-muted-foreground mb-4">
                  Founded by a group of former students who experienced
                  firsthand the challenges of finding good accommodation,
                  Hallynk was born out of a desire to make a difference. We
                  understood the stress, the uncertainty, and the time it took
                  to secure a decent place to stay while focusing on studies.
                </p>
                <p className="text-muted-foreground">
                  Driven by this experience, we set out to create a platform
                  that is not just a listing service, but a comprehensive
                  solution. We focused on verification, transparency, and
                  user-friendliness to build a community of trust for students
                  and hostel owners alike.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Why Choose Hallynk Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-center mb-8">
            Why Choose Hallynk?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <ShieldCheck className="h-12 w-12 text-primary mb-3" />
              <h3 className="text-xl font-medium mb-2">Verified Hostels</h3>
              <p className="text-muted-foreground text-sm">
                Every hostel listing is thoroughly checked by our team to ensure
                quality and safety standards.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <ThumbsUp className="h-12 w-12 text-primary mb-3" />
              <h3 className="text-xl font-medium mb-2">Easy Booking</h3>
              <p className="text-muted-foreground text-sm">
                A simple, secure, and fast booking process right from your
                device, anytime, anywhere.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <HeartHandshake className="h-12 w-12 text-primary mb-3" />
              <h3 className="text-xl font-medium mb-2">Dedicated Support</h3>
              <p className="text-muted-foreground text-sm">
                Our friendly support team is always ready to assist you with any
                queries or issues.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section (Placeholder) */}
        <section className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-8">Meet Our Team</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We are a passionate team of developers, designers, and student
            welfare advocates dedicated to making Hallynk the best it can be.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Placeholder Team Members */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-300 mb-2 flex items-center justify-center">
                  <Users className="h-10 w-10 text-gray-500" />
                </div>
                <h4 className="font-medium">Team Member {i}</h4>
                <p className="text-sm text-muted-foreground">Role/Title</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center py-10 bg-primary/5 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">
            Ready to Find Your Hostel?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of students who have found their ideal accommodation
            with Hallynk.
          </p>
          <Button asChild size="lg">
            <Link href="/hostels">Browse Hostels Now</Link>
          </Button>
        </section>
      </main>

      {/* Footer Placeholder - Assuming a global footer exists */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Hallynk. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
