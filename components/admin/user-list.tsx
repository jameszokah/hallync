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
import { Search, MoreHorizontal, Edit, Trash, UserCog } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string
  university: string | null
  created_at: string
}

interface AdminUserListProps {
  users: User[]
  totalUsers: number
  currentPage: number
  pageSize: number
  role: string
  search: string
}

export function AdminUserList({
  users,
  totalUsers,
  currentPage,
  pageSize,
  role: initialRole,
  search: initialSearch,
}: AdminUserListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [role, setRole] = useState(initialRole)
  const [search, setSearch] = useState(initialSearch)

  const totalPages = Math.ceil(totalUsers / pageSize)

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (role) params.set("role", role)
    if (search) params.set("search", search)
    params.set("page", "1") // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleRoleChange = (value: string) => {
    setRole(value)
    const params = new URLSearchParams()
    if (value) params.set("role", value)
    if (search) params.set("search", search)
    params.set("page", "1") // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  const handleDeleteUser = (userId: string) => {
    // In a real app, this would be a confirmation dialog and server action
    toast({
      title: "Not implemented",
      description: "User deletion would be implemented here",
    })
  }

  const handleChangeRole = (userId: string) => {
    // In a real app, this would open a dialog to change the user's role
    toast({
      title: "Not implemented",
      description: "Role change would be implemented here",
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "owner":
        return "outline"
      default:
        return "secondary"
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
              placeholder="Search users..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="owner">Hostel Owners</SelectItem>
            <SelectItem value="admin">Administrators</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">University</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.first_name ? `${user.first_name} ${user.last_name}` : "—"}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.university || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
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
                        <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit user
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(user.id)}>
                          <UserCog className="h-4 w-4 mr-2" />
                          Change role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete user
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
                  role ? `&role=${role}` : ""
                }${search ? `&search=${search}` : ""}`}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`${pathname}?page=${pageNum}${role ? `&role=${role}` : ""}${
                      search ? `&search=${search}` : ""
                    }`}
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
                    href={`${pathname}?page=${totalPages}${role ? `&role=${role}` : ""}${
                      search ? `&search=${search}` : ""
                    }`}
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
                  role ? `&role=${role}` : ""
                }${search ? `&search=${search}` : ""}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
