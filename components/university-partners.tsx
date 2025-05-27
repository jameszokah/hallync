import Image from "next/image";

interface University {
  id: string;
  name: string;
  location: string;
}

interface UniversityPartner {
  id: string;
  name: string;
  logoUrl: string;
}

interface UniversityPartnersProps {
  universities: University[];
}

// Sample data - replace with actual data fetching if available
const universityPartnersData: UniversityPartner[] = [
  {
    id: "ug",
    name: "University of Ghana",
    logoUrl: "https://www.ug.edu.gh/sites/default/files/ug_logo_n.png",
  },
  {
    id: "knust",
    name: "Kwame Nkrumah University of Science and Technology",
    logoUrl: "https://www.knust.edu.gh/themes/knust/images/logo.png",
  },
  {
    id: "ucc",
    name: "University of Cape Coast",
    logoUrl: "https://ucc.edu.gh/sites/default/files/ucc_logo.png",
  },
  // Add more university partners here
];

export function UniversityPartners({ universities }: UniversityPartnersProps) {
  // If no universities are provided, use a default list
  const partners =
    universities.length > 0
      ? universities
      : [
          { id: "1", name: "University of Ghana", location: "Legon" },
          { id: "2", name: "KNUST", location: "Kumasi" },
          { id: "3", name: "University of Cape Coast", location: "Cape Coast" },
          { id: "4", name: "Central University", location: "Accra" },
          { id: "5", name: "Ashesi University", location: "Berekuso" },
        ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          Our University Partners
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We work closely with universities across Ghana to ensure quality
          accommodation for students
        </p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {universityPartnersData.map((partner) => (
          <div
            key={partner.id}
            className="relative flex items-center justify-center h-20 group"
          >
            <Image
              src={partner.logoUrl}
              alt={partner.name}
              fill
              className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
