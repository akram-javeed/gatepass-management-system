"use client"

import type React from "react"

import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Users, FileText, Shield, LogOut, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { AuthWrapper } from "@/components/auth-wrapper"

interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: string
  employeeId: string
  isActive: boolean
  createdAt: string
}

interface GatePassApplication {
  id: string
  loaNumber: string
  firmName: string
  contractorName: string
  status: string
  submittedDate: string
}

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [users, setUsers] = useState<User[]>([])

    useEffect(() => {
      fetch('http://localhost:5000/api/users')
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((err) => console.error("Failed to load users", err))
    }, [])

  const [applications, setApplications] = useState<GatePassApplication[]>([
    {
      id: "1",
      loaNumber: "LOA/2024/001",
      firmName: "ABC Construction Ltd",
      contractorName: "John Contractor",
      status: "pending",
      submittedDate: "2024-01-20",
    },
    {
      id: "2",
      loaNumber: "LOA/2024/002",
      firmName: "XYZ Engineering",
      contractorName: "Jane Builder",
      status: "approved",
      submittedDate: "2024-01-18",
    },
  ])

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "",
    employeeId: "",
    password: "",
  })

  const roles = [
    { value: "contract_section", label: "Contract Section" },
    { value: "sse", label: "SSE" },
    { value: "safety_officer", label: "Safety Officer" },
    { value: "officer1", label: "Officer 1" },
    { value: "officer2", label: "Officer 2" },
    { value: "chos_npb", label: "Ch.OS/NPB" },
    { value: "admin", label: "Administrator" },
  ]

  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        const res = await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        })
        if (res.ok) {
          const newRes = await fetch('http://localhost:5000/api/users')
          const updatedUsers = await newRes.json()
          setUsers(updatedUsers)
          toast({ title: "User Created", description: "New user has been created." })
          setIsDialogOpen(false)
        }
      } catch (err) {
        console.error("Create user failed", err)
      }
    }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setNewUser({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      employeeId: user.employeeId,
      password: "",
    })
    setIsDialogOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/users/${editingUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        const refreshed = await fetch("http://localhost:5000/api/users");
        const updated = await refreshed.json();
        setUsers(updated);
        setIsDialogOpen(false);
        setEditingUser(null);
        toast({ title: "User Updated", description: "User details updated." });
      }
    } catch (err) {
      console.error("Error updating user", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
  const res = await fetch(`http://localhost:5000/api/users/${id}`, { method: "DELETE" });
  if (res.ok) {
    setUsers(users.filter((u) => u.id !== id));
    toast({ title: "User Deleted" });
  }
};

  const toggleUserStatus = async (id: string) => {
  const res = await fetch(`http://localhost:5000/api/users/${id}/status`, {
    method: "PATCH",
  });
  if (res.ok) {
    const refreshed = await fetch("http://localhost:5000/api/users");
    const updated = await refreshed.json();
    setUsers(updated);
    toast({ title: "User Status Updated" });
  }
};

  const handleLogout = () => {
    localStorage.removeItem("user_session")
    router.push("/")
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: "bg-red-100 text-red-800",
      contract_section: "bg-blue-100 text-blue-800",
      sse: "bg-green-100 text-green-800",
      safety_officer: "bg-yellow-100 text-yellow-800",
      officer1: "bg-purple-100 text-purple-800",
      officer2: "bg-indigo-100 text-indigo-800",
      chos_npb: "bg-pink-100 text-pink-800",
    }
    return roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <AuthWrapper requiredRole="admin" redirectTo="/">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="h-8 w-8 text-red-600" />
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">System Administration Panel</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Applications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Create, edit, and manage system users</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setEditingUser(null)
                            setNewUser({
                              username: "",
                              email: "",
                              fullName: "",
                              role: "",
                              employeeId: "",
                              password: "",
                            })
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
                          <DialogDescription>
                            {editingUser ? "Update user information" : "Add a new user to the system"}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={newUser.username}
                              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                              placeholder="Enter username"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                              placeholder="Enter email"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={newUser.fullName}
                              onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                              placeholder="Enter full name"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                              id="employeeId"
                              value={newUser.employeeId}
                              onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                              placeholder="Enter employee ID"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                              value={newUser.role}
                              onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password">
                              {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                            </Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Enter password"
                                required={!editingUser}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                              {editingUser ? "Update User" : "Create User"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Employee ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.fullName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge className={getRoleBadge(user.role)}>
                                {roles.find((r) => r.value === user.role)?.label || user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.employeeId}</TableCell>
                            <TableCell>
                              <Badge
                                variant={user.isActive ? "default" : "secondary"}
                                className={user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user.id)}>
                                  {user.isActive ? "Disable" : "Enable"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Gate Pass Applications</CardTitle>
                  <CardDescription>View and manage all gate pass applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>LOA Number</TableHead>
                          <TableHead>Firm Name</TableHead>
                          <TableHead>Contractor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.loaNumber}</TableCell>
                            <TableCell>{app.firmName}</TableCell>
                            <TableCell>{app.contractorName}</TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell>{app.submittedDate}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthWrapper>
  )
}
