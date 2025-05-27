"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Edit, Trash, Check, X, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { verifyHostel, rejectHostel } from "@/lib/actions/admin"

interface Hostel {
  id: string
  name: string
  location: string
  verified: boolean
  university: string
  created_at: string
  users: {
    email: string
  }
}

interface University {
  id: string
  name: string
}

interface AdminHostelListProps {
  hostels: Hostel[]
  totalHostels: number
  currentPage: number
  pageSize: number
  verified: string
  university: string
  search: string
  universities: University[]
}

export function AdminHostelList({
  hostels,
  totalHostels,
  currentPage,
  pageSize,
  verified: initialVerified,
  university: initialUniversity,
  search: initialSearch,
  universities,
}: AdminHostelListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [verified, setVerified] = useState(initialVerified)
  const [university, setUniversity] = useState(initialUniversity)
  const [search, setSearch] = useState(initialSearch)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const totalPages = Math.ceil(totalHostels / pageSize)

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (verified) params.set("verified", verified)
    if (university) params.set("university", university)
    if (search) params.set("search", search)
    params.set("page", "1") // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleVerifiedChange = (value: string) => {
    setVerified(value)
    const params = new URLSearchParams()
    if (value) params.set("verified", value)
    if (university) params.set("university", university)
    if (search) params.set("search", search)
    params.set("page", "1") // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleUniversityChange = (value: string) => {
    setUniversity(value)
    const params = new URLSearchParams()
    if (verified) params.set("verified", verified)
    if (value) params.set("university", value)
    if (search) params.set("search", search)
    params.set("page", "1") // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

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

  const handleDeleteHostel = (hostelId: string) => {
    // In a real app, this would be a confirmation dialog and server action
    toast({
      title: "Not implemented",
      description: "Hostel deletion would be implemented here",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search hostels..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        <div className="flex gap-2">
          <Select value={verified} onValueChange={handleVerifiedChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All hostels</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>
          <Select value={university} onValueChange={handleUniversityChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All universities</SelectItem>
              {universities.map((uni) => (
                <SelectItem key={uni.id} value={uni.id}>
                  {uni.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hostel</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="hidden md:table-cell">University</TableHead>
              <TableHead className="hidden md:table-cell">Added</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hostels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hostels found
                </TableCell>
              </TableRow>
            ) : (
              hostels.map((hostel) => (
                <TableRow key={hostel.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{hostel.name}</div>
                      <div className="text-sm text-muted-foreground">{hostel.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>{hostel.users.email}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {universities.find((u) => u.id === hostel.university)?.name || hostel.university}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDistanceToNow(new Date(hostel.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {hostel.verified ? (
                      <Badge variant="default">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/admin/hostels/${hostel.id}`)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/hostels/${hostel.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit hostel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!hostel.verified ? (
                          <DropdownMenuItem
                            onClick={() => handleVerify(hostel.id)}
                            disabled={processingIds.has(hostel.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Verify hostel
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleReject(hostel.id)}
                            disabled={processingIds.has(hostel.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Revoke verification
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteHostel(hostel.id)}>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete hostel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`${pathname}?page=${Math.max(1, currentPage - 1)}${
                  verified ? `&verified=${verified}` : ""
                }${university ? `&university=${university}` : ""}${search ? `&search=${search}` : ""}`}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`${pathname}?page=${pageNum}${
                      verified ? `&verified=${verified}` : ""
                    }${university ? `&university=${university}` : ""}${search ? `&search=${search}` : ""}`}
                    isActive={pageNum === currentPage}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            {totalPages > 5 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href={`${pathname}?page=${totalPages}${
                      verified ? `&verified=${verified}` : ""
                    }${university ? `&university=${university}` : ""}${search ? `&search=${search}` : ""}`}
                    isActive={totalPages === currentPage}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            <PaginationItem>
              <PaginationNext
                href={`${pathname}?page=${Math.min(totalPages, currentPage + 1)}${
                  verified ? `&verified=${verified}` : ""
                }${university ? `&university=${university}` : ""}${search ? `&search=${search}` : ""}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
