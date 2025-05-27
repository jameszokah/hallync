"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { verifyHostel, rejectHostel } from "@/lib/actions/admin"

interface Hostel {
  id: string
  name: string
  location: string
  owner_id: string
  created_at: string
  users: {
    email: string
  }
}

interface AdminHostelVerificationProps {
  hostels: Hostel[]
}

export function AdminHostelVerification({ hostels }: AdminHostelVerificationProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const handleVerify = async (hostelId: string) => {
    setProcessingIds((prev) => new Set(prev).add(hostelId))
    try {
      const result = await verifyHostel(hostelId)
      if (result.success) {
        toast({
          title: "Hostel verified",
          description: "The hostel has been successfully verified",
        })
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to verify hostel")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while verifying the hostel",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(hostelId)
        return newSet
      })
    }
  }

  const handleReject = async (hostelId: string) => {
    setProcessingIds((prev) => new Set(prev).add(hostelId))
    try {
      const result = await rejectHostel(hostelId)
      if (result.success) {
        toast({
          title: "Hostel rejected",
          description: "The hostel has been rejected",
        })
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to reject hostel")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while rejecting the hostel",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(hostelId)
        return newSet
      })
    }
  }

  if (hostels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Verification</CardTitle>
          <CardDescription>Hostels waiting for admin verification</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">No hostels pending verification</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Verification</CardTitle>
        <CardDescription>Hostels waiting for admin verification</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hostels.map((hostel) => (
            <div
              key={hostel.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{hostel.name}</h3>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{hostel.location}</p>
                <p className="text-xs text-muted-foreground">
                  Owner: {hostel.users.email} • Added{" "}
                  {formatDistanceToNow(new Date(hostel.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <Button variant="outline" size="sm" onClick={() => router.push(`/admin/hostels/${hostel.id}`)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleVerify(hostel.id)}
                  disabled={processingIds.has(hostel.id)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Verify
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(hostel.id)}
                  disabled={processingIds.has(hostel.id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
