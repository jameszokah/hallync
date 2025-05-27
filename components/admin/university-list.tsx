"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Edit, Trash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface University {
  id: string
  name: string
  location: string
  created_at: string
}

interface AdminUniversityListProps {
  universities: University[]
}

export function AdminUniversityList({ universities }: AdminUniversityListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newUniversity, setNewUniversity] = useState({ name: "", location: "" })
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null)

  const handleAddUniversity = () => {
    // In a real app, this would be a server action
    toast({
      title: "University added",
      description: `${newUniversity.name} has been added to the platform`,
    })
    setIsAddDialogOpen(false)
    setNewUniversity({ name: "", location: "" })
    router.refresh()
  }

  const handleEditUniversity = () => {
    // In a real app, this would be a server action
    if (editingUniversity) {
      toast({
        title: "University updated",
        description: `${editingUniversity.name} has been updated`,
      })
      setIsEditDialogOpen(false)
      setEditingUniversity(null)
      router.refresh()
    }
  }

  const handleDeleteUniversity = (university: University) => {
    // In a real app, this would be a confirmation dialog and server action
    toast({
      title: "University deleted",
      description: `${university.name} has been removed from the platform`,
    })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Universities</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add University
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New University</DialogTitle>
              <DialogDescription>
                Add a new university to the platform. This will be available for students and hostel owners.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">University Name</Label>
                <Input
                  id="name"
                  value={newUniversity.name}
                  onChange={(e) => setNewUniversity({ ...newUniversity, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newUniversity.location}
                  onChange={(e) => setNewUniversity({ ...newUniversity, location: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUniversity}>Add University</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit University</DialogTitle>
              <DialogDescription>Update the university details.</DialogDescription>
            </DialogHeader>
            {editingUniversity && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">University Name</Label>
                  <Input
                    id="edit-name"
                    value={editingUniversity.name}
                    onChange={(e) => setEditingUniversity({ ...editingUniversity, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editingUniversity.location}
                    onChange={(e) => setEditingUniversity({ ...editingUniversity, location: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUniversity}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="hidden md:table-cell">Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {universities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No universities found
                </TableCell>
              </TableRow>
            ) : (
              universities.map((university) => (
                <TableRow key={university.id}>
                  <TableCell className="font-medium">{university.name}</TableCell>
                  <TableCell>{university.location}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDistanceToNow(new Date(university.created_at), { addSuffix: true })}
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
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingUniversity(university)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit university
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteUniversity(university)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete university
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
    </div>
  )
}
