import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const distanceToCampus = [
  { label: "0-1km", value: "0-1" },
  { label: "1-2km", value: "1-2" },
  { label: "2-3km", value: "2-3" },
  { label: "3-4km", value: "3-4" },
  { label: "4-5km", value: "4-5" },
  { label: "5-6km", value: "5-6" },
  { label: "6-7km", value: "6-7" },
  { label: "7-8km", value: "7-8" },
  { label: "8-9km", value: "8-9" },
  { label: "9-10km", value: "9-10" },
  { label: "10-11km", value: "10-11" },
  { label: "11-12km", value: "11-12" },
  { label: "12-13km", value: "12-13" },
  { label: "13-14km", value: "13-14" },
  { label: "14-15km", value: "14-15" },
  { label: "15-16km", value: "15-16" },
  { label: "16-17km", value: "16-17" },
] as const;

export const roomTypes = [
  { label: "Single Room", value: "single" },
  { label: "Double Room", value: "double" },
  { label: "Shared Room (3+ beds)", value: "shared" },
  
] as const;



export const amenities = [
  { label: "Wifi", value: "wifi", description: "Free Wi-Fi access for all guests" },
  { label: "Security", value: "security" , description: "24/7 security guard"},
  { label: "Water", value: "water" , description: "Free water access for all guests"},
  { label: "Electricity", value: "electricity" , description: "Free electricity access for all guests"},
  { label: "Study Room", value: "study_room" , description: "Free study room access for all guests"},
  { label: "Kitchen", value: "kitchen" , description: "Free kitchen access for all guests"},
  { label: "Laundry", value: "laundry" , description: "Free laundry access for all guests"},
  { label: "Furnished", value: "furnished" , description: "Free furnished access for all guests"},
  { label: "Bathroom", value: "bathroom" , description: "Free bathroom access for all guests"},
  { label: "Balcony", value: "balcony" , description: "Free balcony access for all guests"},
  { label: "Air Conditioning", value: "air_conditioning" , description: "Free air conditioning access for all guests"},
  { label: "TV", value: "tv" , description: "Free TV access for all guests"},
  { label: "Fridge", value: "fridge" , description: "Free fridge access for all guests"},
  { label: "Microwave", value: "microwave" , description: "Free microwave access for all guests"},
  { label: "Washing Machine", value: "washing_machine" , description: "Free washing machine access for all guests"},
] as const;