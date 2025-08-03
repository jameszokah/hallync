import { getRoomById } from "@/lib/actions/room"
import { notFound } from "next/navigation"
import { RoomDetails } from "@/components/owner/room-details"

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ room_id: string }>
}) {
  const room = await getRoomById((await params).room_id)

  if (!room) {
    notFound()
  }

  return <RoomDetails initialRoom={room as any} />
}
