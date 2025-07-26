import Link from "next/link"
import Image from "next/image"
import { Star, MapPin, Wifi, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Hostels } from "@/app/generated/prisma"

  export interface IHostel extends Hostels {
    id: string
    name: string
    location: string
    university: string
    verified: boolean
    image: string
    rating: number
    reviews: number
    price: number
    priceUnit: string
    amenities: string[]
  }

interface FeaturedHostelsProps {
  hostels: IHostel[];
}

export function FeaturedHostels({ hostels }: FeaturedHostelsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hostels.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No featured hostels available at the moment.</p>
        </div>
      ) : (
        hostels.map((hostel) => (
          <Link
            href={`/hostels/${hostel.id}`}
            key={hostel.id}
            className="group bg-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <div className="relative h-48 w-full">
                <Image
                  src={hostel.image || "/placeholder.svg"}
                  alt={hostel.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {hostel.verified && (
                <Badge className="absolute top-2 right-2 bg-green-600" variant="secondary">
                  <Shield className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
              <Badge className="absolute bottom-2 left-2">{hostel.university}</Badge>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{hostel?.name}</h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{hostel?.rating?.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground ml-1">({hostel?.reviews})</span>
                </div>
              </div>
              <div className="flex items-center text-muted-foreground text-sm mb-3">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{hostel?.location}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {hostel.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity === "WiFi" && <Wifi className="h-3 w-3 mr-1" />}
                    {amenity === "Security" && <Shield className="h-3 w-3 mr-1" />}
                    {amenity}
                  </Badge>
                ))}
                {hostel.amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{hostel.amenities.length - 3} more
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-lg">₵{hostel?.price?.toLocaleString()}</span>
                  <span className="text-muted-foreground text-xs">/{hostel?.priceUnit}</span>
                </div>
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
