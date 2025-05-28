"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";

export default function ContactUsPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Form submitted:", formData);
    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. We'll get back to you soon.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const faqs = [
    {
      question: "How do I list my hostel on Hallynk?",
      answer:
        "You can register as a hostel owner and follow the simple steps in your dashboard to list your property. You'll need to provide details about your hostel, room types, amenities, and images.",
    },
    {
      question: "What are the verification criteria for hostels?",
      answer:
        "We verify hostels based on safety, cleanliness, accuracy of information provided, and essential amenities. Our team may conduct physical inspections or request documentation.",
    },
    {
      question: "How does the booking process work for students?",
      answer:
        "Students can browse listings, filter by preferences, view hostel details, and book a room directly through our platform. Secure payment options are available.",
    },
    {
      question: "What if I have an issue with a booking?",
      answer:
        "Please contact our support team immediately through the contact form, email, or phone. We are here to help resolve any issues you may encounter.",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header Placeholder */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Hallynk
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/hostels" className="text-sm hover:text-primary">
              Browse Hostels
            </Link>
            <Link href="/about" className="text-sm hover:text-primary">
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-sm text-primary font-semibold"
            >
              Contact Us
            </Link>
            {/* Add other nav links as needed */}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <MessageSquare className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions, feedback, or need support? We're here to help! Reach
            out to us through any of the channels below, or use the contact
            form.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
              <CardDescription>
                We typically respond within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Booking Inquiry"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Your message here..."
                    className="min-h-32"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Send className="mr-2 h-4 w-4 animate-pulse" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <a
                      href="mailto:support@hallynk.com"
                      className="text-muted-foreground hover:text-primary"
                    >
                      support@hallynk.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <a
                      href="tel:+233551234567"
                      className="text-muted-foreground hover:text-primary"
                    >
                      +233 55 123 4567 (Ghana)
                    </a>
                    <p className="text-xs text-muted-foreground">
                      Mon - Fri, 9am - 5pm GMT
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Office Address</h3>
                    <p className="text-muted-foreground">
                      123 Hallynk Street, Tech Junction
                      <br />
                      Accra, Ghana (Placeholder)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder for Map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Map Placeholder (e.g., Google Maps Embed)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-8">
            <HelpCircle className="mx-auto h-10 w-10 text-primary mb-3" />
            <h2 className="text-3xl font-semibold">
              Frequently Asked Questions
            </h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index + 1}`} key={index}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer Placeholder */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Hallynk. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
