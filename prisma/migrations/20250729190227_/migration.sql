-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "amenities" JSONB;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "Hostels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
