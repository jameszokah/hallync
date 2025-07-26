"use client";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Define the type for booking dates
export type BookingDate = {
  date: Date;
  type: string;
  bookingId: string;
};

interface BookingCalendarProps {
  bookingDates: BookingDate[];
  onDateSelect?: (date: Date | undefined) => void;
  initialDate?: Date;
}

export function BookingCalendar({
  bookingDates,
  onDateSelect,
  initialDate,
}: BookingCalendarProps) {
  const [selected, setSelected] = useState<Date | undefined>(initialDate);

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    onDateSelect?.(date);
  };

  // Convert booking dates to strings for easier comparison
  const bookingDatesSet = new Set(
    bookingDates.map((bd) => bd.date.toDateString())
  );

  return (
    <div className="booking-calendar-container">
      <style jsx global>{`
        .booking-indicator::after {
          content: "";
          position: absolute;
          bottom: 1px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background-color: hsl(var(--primary));
          border-radius: 50%;
        }
      `}</style>

      <Calendar
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        className="rounded-md border-0"
        // Use CSS classes to style booked days
        modifiers={{
          booked: bookingDates.map((bd) => bd.date),
        }}
        modifiersClassNames={{
          booked: "booking-indicator",
        }}
        // General calendar styling
        classNames={{
          day_today: "bg-primary/5 font-bold text-primary",
          day_selected: "bg-primary text-primary-foreground",
          day: "relative h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          cell: "h-9 w-9 p-0 focus-within:relative focus-within:z-20",
        }}
      />
    </div>
  );
}
