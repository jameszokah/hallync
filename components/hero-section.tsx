"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface University {
  id: string;
  name: string;
  location: string;
}

interface HeroSectionProps {
  universities: University[];
}

export function HeroSection({ universities }: HeroSectionProps) {
  const router = useRouter();
  const [university, setUniversity] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (university) params.set("university", university);
    if (location) params.set("location", location);

    router.push(`/hostels?${params.toString()}`);
  };

  return (
    <section className="relative bg-primary text-primary-foreground">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hallynk_banner.jpg"
          alt="Students in front of a hostel"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <div className="absolute top-4 right-4 z-20">
          <Link href="/auth/login">
            <Button variant="secondary" className="text-sm">
              Login / Register
            </Button>
          </Link>
        </div>
        <div className="max-w-3xl mx-auto text-center mb-8 pt-12 md:pt-0">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
            Find Your Perfect Student Hostel in Ghana
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            Verified, affordable accommodation for university students
          </p>
          <form
            onSubmit={handleSearch}
            className="bg-background text-foreground rounded-lg p-4 shadow-lg"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select value={university} onValueChange={setUniversity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select University" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Location (e.g., Legon, East Legon)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button type="submit" className="md:w-auto w-full">
                <Search className="mr-2 h-4 w-4" /> Search Hostels
              </Button>
            </div>
          </form>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">700K+</div>
            <div className="text-sm">University Students</div>
          </div>
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">500+</div>
            <div className="text-sm">Verified Hostels</div>
          </div>
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">10+</div>
            <div className="text-sm">University Partners</div>
          </div>
        </div>
      </div>
    </section>
  );
}
