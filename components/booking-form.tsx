"use client";

import { useState } from "react";
import { Calendar, CreditCard, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createBooking } from "@/lib/actions/booking";
import { formatDate } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Hostel {
  id: string;
  name: string;
  price: number;
  priceUnit: string;
  rooms: {
    type: string;
    price: number;
    available: number;
  }[];
}

export function BookingForm({ hostel }: { hostel: any }) {
  const [selectedRoomType, setSelectedRoomType] = useState(
    hostel?.rooms?.[0]?.type || ""
  );
  const [selectedRoomPrice, setSelectedRoomPrice] = useState(
    hostel?.rooms?.[0]?.price || 0
  );
  const [selectedRoom, setSelectedRoom] = useState(hostel?.rooms?.[0] || null);
  const [moveInDate, setMoveInDate] = useState<Date | undefined>(undefined);
  const [moveOutDate, setMoveOutDate] = useState<Date | undefined>(undefined);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const handleRoomTypeChange = (value: string) => {
    setSelectedRoomType(value);
    const roomType = hostel?.rooms?.find((room: any) => room.type === value);
    if (roomType) {
      setSelectedRoomPrice(roomType.price);
      setSelectedRoom(roomType);
    }
  };

  const handleReserveNow = async () => {
    if (!moveInDate || !moveOutDate) {
      toast.error("Please select a move-in and move-out date");
      return;
    }
    if (!selectedRoom) {
      toast.error("Please select a room type");
      return;
    }
    try {
      setIsLoading(true);
      const booking = await createBooking({
        roomId: selectedRoom.id,
        hostelId: hostel.id,
        moveInDate,
        moveOutDate,
        
        amount: selectedRoomPrice + 100 + 200,
      });
      if (booking) {
        toast.success("Booking created successfully");
        router.push(`/booking/${booking.id}`);
      } else {
        toast.error("Failed to create booking");
      }
    } catch (error) {
      toast.error("Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  console.log(hostel, "hostel booking form");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Your Stay</CardTitle>
        <CardDescription>
          Secure your room for the upcoming semester
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="room-type">Room Type</Label>
          <Select value={selectedRoomType} onValueChange={handleRoomTypeChange}>
            <SelectTrigger id="room-type">
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              {hostel?.rooms?.map((room: any) => (
                <SelectItem key={room.type} value={room.type}>
                  {room.type} - ₵{room.price.toLocaleString()}/semester
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Move-in Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  {moveInDate ? formatDate(moveInDate, "PPP") : "Pick a date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                initialFocus
                selected={moveInDate}
                onSelect={setMoveInDate}
                disabled={(date) =>
                  new Date() > date || (moveOutDate ? date > moveOutDate || date < new Date() : false)
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Move-out Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  {moveOutDate ? formatDate(moveOutDate, "PPP") : "Pick a date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                initialFocus
                selected={moveOutDate}
                onSelect={setMoveOutDate}
                disabled={(date) => new Date() > date || (moveInDate ? date < moveInDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Duration</Label>
          <Select defaultValue="semester">
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semester">One Semester</SelectItem>
              <SelectItem value="academic-year">Full Academic Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limited availability!</AlertTitle>
          <AlertDescription>
            
            {
              hostel?.rooms?.find((room: any) => room.type === selectedRoomType)
                ?.available ? `Only ${hostel?.rooms?.find((room: any) => room.type === selectedRoomType)
                ?.total_available} rooms of this type left.` : 'No rooms left.'
            }
          </AlertDescription>
        </Alert>

        <div className="pt-4 space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Room fee</span>
            <span>₵{selectedRoomPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking fee</span>
            <span>₵100</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Security deposit (refundable)
            </span>
            <span>₵200</span>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold">
            <span>Total due now</span>
            <span>₵{(selectedRoomPrice + 100 + 200).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button className="w-full mb-4" onClick={handleReserveNow} disabled={isLoading}>
          Reserve Now
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          You won't be charged yet. A ₵200 booking fee secures your room.
        </div>

        {/* <div className="mt-4 pt-4 border-t w-full">
          <div className="text-sm font-medium mb-2">Payment Methods</div>
          <RadioGroup defaultValue="mobile-money">
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="mobile-money" id="mobile-money" />
              <Label htmlFor="mobile-money" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Mobile Money (MTN, Telecel, AirtelTigo)
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="bank-transfer" id="bank-transfer" />
              <Label htmlFor="bank-transfer" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Bank Transfer
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Credit/Debit Card
              </Label>
            </div>
          </RadioGroup>
        </div> */}
      </CardFooter>
    </Card>
  );
}
