import { Search, Building, CreditCard, Star } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-10 w-10" />,
      title: "Search & Filter",
      description: "Find hostels near your university with our advanced filters for price, amenities, and more.",
    },
    {
      icon: <Building className="h-10 w-10" />,
      title: "Compare Options",
      description: "View photos, amenities, prices, and read verified reviews from other students.",
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: "Book & Pay Securely",
      description: "Reserve your room and pay securely with Mobile Money, bank transfer, or card.",
    },
    {
      icon: <Star className="h-10 w-10" />,
      title: "Move In & Review",
      description: "Move into your new hostel and share your experience to help other students.",
    },
  ]

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">How Hallynk Works</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Finding and booking your student hostel is simple and secure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className="bg-primary/10 rounded-full p-6 inline-flex mb-4 text-primary">{step.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
