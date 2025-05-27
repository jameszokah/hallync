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
import { Search, MoreHorizontal, Eye, Check, X } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface Booking {
  id: string
  check_in_date: string
  check_out_date: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  payment_status: "pending" | "partial" | "completed"
  created_at: string
  users: {
    email: string
    first_name: string | null
    last_name: string | null
  }
  hostels: {
    name: string
  }
  rooms: {
    type: string
    price: number
  }
}

interface AdminBookingListProps {
  bookings: Booking[]
  totalBookings: number
  currentPage: number
  pageSize: number
  status: string
  search: string
}

export function AdminBookingList({
  bookings,
  totalBookings,
  currentPage,
  pageSize,
  status: initialStatus,
  search: initialSearch,
}: AdminBookingListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [status, setStatus] = useState(initialStatus)
  const [search, setSearch] = useState(initialSearch)

  const totalPages = Math.ceil(totalBookings / pageSize)

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (search) params.set("search", search)
    params.set("page", "1") // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    const params = new URLSearchParams()
    if (value) params.set("status", value)
    if (search) params.set("search", search)
    params.set("page", "1") // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const handleViewBooking = (bookingId: string) => {
    router.push(`/admin/bookings/${bookingId}`)
  }

  const handleConfirmBooking = (bookingId: string) => {
    // In a real app, this would be a server action
    toast({
      title: "Booking confirmed",
      description: "The booking has been confirmed",
    })
    router.refresh()
  }

  const handleCancelBooking = (bookingId: string) => {
    // In a real app, this would be a server action
    toast({
      title: "Booking cancelled",
      description: "The booking has been cancelled",
    })
    router.refresh()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      case "completed":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "partial":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bookings..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Hostel</TableHead>
              <TableHead className="hidden md:table-cell">Check-in/out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {booking.users.first_name ? `${booking.users.first_name} ${booking.users.last_name}` : "—"}
                      </div>
                      <div className="text-sm text-muted-foreground">{booking.users.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{booking.hostels.name}</div>
                      <div className="text-sm text-muted-foreground">{booking.rooms.type}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">
                      <div>{format(new Date(booking.check_in_date), "MMM d, yyyy")}</div>
                      <div>{format(new Date(booking.check_out_date), "MMM d, yyyy")}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentStatusBadgeVariant(booking.payment_status)}>
                      {booking.payment_status === "completed"
                        ? "Paid"
                        : booking.payment_status === "partial"
                          ? "Partial"
                          : "Unpaid"}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleViewBooking(booking.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View details
                        </DropdownMenuItem>
                        {booking.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleConfirmBooking(booking.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Confirm booking
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel booking
                            </DropdownMenuItem>
                          </>
                        )}
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
                  status ? `&status=${status}` : ""
                }${search ? `&search=${search}` : ""}`}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`${pathname}?page=${pageNum}${
                      status ? `&status=${status}` : ""
                    }${search ? `&search=${search}` : ""}`}
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
                      status ? `&status=${status}` : ""
                    }${search ? `&search=${search}` : ""}`}
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
                  status ? `&status=${status}` : ""
                }${search ? `&search=${search}` : ""}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
