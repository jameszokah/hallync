-- AlterTable
ALTER TABLE "Hostels" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "capacity" SET DEFAULT 0;
