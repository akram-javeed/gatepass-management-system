"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock, LogOut, Plus, FileText, Search, Building2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Firm {
  id: string
  firmName: string
  address: string
  contactPerson: string
  phone: string
  email: string
  contractorName: string
  pan: string
  gst: string
}

interface Contract {
  id: string
  loa_number: string
  loa_date: string
  work_description: string
  firm_name: string
  contractor_name: string
  contract_period_from: string
  contract_period_to: string
  created_at: string
}

interface User {
  id: string
  role: string
  name: string
  email: string
}

interface SSEUser {
  id: number
  username: string
  full_name: string
  employee_id: string
  role: string
}

interface OfficerUser {
  id: number
  username: string
  full_name: string
  employee_id: string
  role: string
}

export default function ContractSectionPage() {
  const { toast } = useToast()
  const [firms, setFirms] = useState<Firm[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [shops, setShops] = useState<{ id: number, name: string }[]>([])
  const [sseUsers, setSseUsers] = useState<SSEUser[]>([])
  const [officerUsers, setOfficerUsers] = useState<OfficerUser[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contractSearchTerm, setContractSearchTerm] = useState("")
  
  const [formData, setFormData] = useState({
    firmId: "",
    loaNumber: "",
    date: undefined as Date | undefined,
    workDescription: "",
    shopId: "",
    firmName: "",
    contractorName: "",
    pan: "",
    gst: "",
    address: "",
    email: "",
    phone: "",
    contractPeriodFrom: undefined as Date | undefined,
    contractPeriodTo: undefined as Date | undefined,
    shiftTiming: "",
    executingSSEId: "",
    approvedOfficerId: "",
  })

  const [showFirmDialog, setShowFirmDialog] = useState(false)
  const [showContractsDialog, setShowContractsDialog] = useState(false)
  const [newFirm, setNewFirm] = useState({
    firmName: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
    contractorName: "",
    pan: "",
    gst: "",
  })

  // Get current user from session
  useEffect(() => {
    const sessionData = localStorage.getItem("user_session")
    if (sessionData) {
      const session = JSON.parse(sessionData)
      setCurrentUser({
        id: session.id,
        role: session.role || 'contract_section',
        name: session.name,
        email: session.email
      })
    } else {
      // Redirect to login if no session
      window.location.href = "/login-selection"
    }
  }, [])

  useEffect(() => {
    if (currentUser && currentUser.role === 'contract_section') {
      fetchFirms()
      fetchContracts()
      fetchShops()
      fetchSSEUsers()
      fetchOfficerUsers()
      setIsClient(true)
    }
  }, [currentUser])

  const fetchFirms = async () => {
    try {
      const res = await fetch("/api/firms")
      const data = await res.json()
      setFirms(data)
    } catch (err) {
      console.error("Failed to load firms", err)
      toast({
        title: "Error",
        description: "Failed to load firms",
        variant: "destructive",
      })
    }
  }

  const fetchContracts = async () => {
    try {
      const res = await fetch("/api/contracts")
      const data = await res.json()
      setContracts(data)
    } catch (err) {
      console.error("Failed to load contracts", err)
      toast({
        title: "Error", 
        description: "Failed to load contracts",
        variant: "destructive",
      })
    }
  }

  const fetchShops = async () => {
    try {
      const res = await fetch("/api/shops")
      const data = await res.json()
      setShops(data)
    } catch (error) {
      console.error("Failed to fetch shops", error)
      toast({
        title: "Error",
        description: "Failed to load shops",
        variant: "destructive",
      })
    }
  }

  // ✅ FIXED: Fetch SSE users from users table with role='sse'
  const fetchSSEUsers = async () => {
    try {
      console.log("Fetching SSE users from users table...")
      const res = await fetch("/api/users?role=sse")
      const data = await res.json()
      
      console.log("SSE users response:", data)
      
      if (data.success && data.users) {
        // Transform the data to match expected format
        const transformedSSE = data.users.map(user => ({
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          employee_id: user.employee_id,
          role: user.role
        }))
        setSseUsers(transformedSSE)
        console.log("SSE users loaded:", transformedSSE.length)
      } else {
        console.error("Invalid SSE users response format:", data)
        setSseUsers([])
      }
    } catch (error) {
      console.error("Failed to fetch SSE users:", error)
      toast({
        title: "Error",
        description: "Failed to load SSE users",
        variant: "destructive",
      })
      setSseUsers([])
    }
  }

  // ✅ FIXED: Fetch Officer users from users table with roles 'officer1' and 'officer2'
  const fetchOfficerUsers = async () => {
    try {
      console.log("Fetching Officer users from users table...")
      const res = await fetch("/api/users?roles=officer1,officer2")
      const data = await res.json()
      
      console.log("Officer users response:", data)
      
      if (data.success && data.users) {
        // Transform the data to match expected format
        const transformedOfficers = data.users.map(user => ({
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          employee_id: user.employee_id,
          role: user.role
        }))
        setOfficerUsers(transformedOfficers)
        console.log("Officer users loaded:", transformedOfficers.length)
      } else {
        console.error("Invalid officer users response format:", data)
        setOfficerUsers([])
      }
    } catch (error) {
      console.error("Failed to fetch officer users:", error)
      toast({
        title: "Error",
        description: "Failed to load officer users",
        variant: "destructive",
      })
      setOfficerUsers([])
    }
  }

  const handleFirmSelection = (firmId: string) => {
    const selected = firms.find((f) => f.id === firmId)
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        firmId: selected.id,
        firmName: selected.firmName,
        contractorName: selected.contractorName,
        pan: selected.pan,
        gst: selected.gst,
        address: selected.address,
        email: selected.email,
        phone: selected.phone,
      }))
    }
  }

  const handleAddFirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch("/api/firms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFirm),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to add firm")
      }
      
      toast({ 
        title: "Success", 
        description: "New firm added successfully and is now available for contract creation." 
      })
      
      // Reset form
      setNewFirm({
        firmName: "",
        address: "",
        contactPerson: "",
        phone: "",
        email: "",
        contractorName: "",
        pan: "",
        gst: "",
      })
      setShowFirmDialog(false)
      await fetchFirms() // Refresh firms list
    } catch (err) {
      console.error("Add firm error:", err)
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : "Failed to add firm.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // ✅ ENHANCED VALIDATION: Check for SSE and Officer selection
    if (!formData.loaNumber || !formData.date || !formData.workDescription) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.executingSSEId) {
      toast({
        title: "Error",
        description: "Please select an Executing SSE",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.approvedOfficerId) {
      toast({
        title: "Error",
        description: "Please select an Approved Officer",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
          const submitData = {
            firm_id: formData.firmId,
            loaNumber: formData.loaNumber,
            date: formData.date?.toISOString().split('T')[0],
            workDescription: formData.workDescription,
            shopId: formData.shopId,
            contractorName: formData.contractorName,
            pan: formData.pan,
            gst: formData.gst,
            address: formData.address,
            email: formData.email,
            phone: formData.phone,
            contractPeriodFrom: formData.contractPeriodFrom?.toISOString().split('T')[0],
            contractPeriodTo: formData.contractPeriodTo?.toISOString().split('T')[0],
            shiftTiming: formData.shiftTiming,
            executingSSEId: formData.executingSSEId,
            approvedOfficerId: formData.approvedOfficerId,
          }

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to save contract")
      }

      toast({
        title: "Success",
        description: `Contract/LOA ${formData.loaNumber} created successfully! Contractors can now apply for gate passes using this LOA.`,
      })

      // Reset form
      setFormData({
        firmId: "",
        loaNumber: "",
        date: undefined,
        workDescription: "",
        shopId: "",
        firmName: "",
        contractorName: "",
        pan: "",
        gst: "",
        address: "",
        email: "",
        phone: "",
        contractPeriodFrom: undefined,
        contractPeriodTo: undefined,
        shiftTiming: "",
        executingSSEId: "",
        approvedOfficerId: "",
      })

      // Refresh contracts list
      await fetchContracts()
    } catch (err) {
      console.error("Submit error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save contract.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user_session")
    sessionStorage.removeItem("user_session")
    window.location.href = "/"
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const filteredContracts = contracts.filter(contract => 
    contract.loa_number.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
    contract.work_description.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
    contract.firm_name.toLowerCase().includes(contractSearchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Contract Section Dashboard</h1>
              <p className="text-sm text-gray-600">Manage firms, contracts and LOA entries for gate pass applications</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-gray-600">Contract Section</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Firms</CardDescription>
              <CardTitle className="text-3xl">{firms.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Contracts</CardDescription>
              <CardTitle className="text-3xl">{contracts.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active LOAs</CardDescription>
              <CardTitle className="text-3xl">
                {contracts.filter(c => new Date(c.contract_period_to) > new Date()).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>This Month</CardDescription>
              <CardTitle className="text-3xl">
                {contracts.filter(c => {
                  const contractDate = new Date(c.created_at)
                  const now = new Date()
                  return contractDate.getMonth() === now.getMonth() && contractDate.getFullYear() === now.getFullYear()
                }).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Dialog open={showFirmDialog} onOpenChange={setShowFirmDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Add New Firm
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={showContractsDialog} onOpenChange={setShowContractsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View All Contracts
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Add Firm Dialog */}
        <Dialog open={showFirmDialog} onOpenChange={setShowFirmDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Firm</DialogTitle>
              <DialogDescription>
                Add a new firm with contractor details. This firm will be available for creating contracts/LOAs.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddFirm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Firm Name *</Label>
                  <Input 
                    value={newFirm.firmName} 
                    onChange={(e) => setNewFirm({ ...newFirm, firmName: e.target.value })} 
                    placeholder="Enter firm name"
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input 
                    value={newFirm.contactPerson} 
                    onChange={(e) => setNewFirm({ ...newFirm, contactPerson: e.target.value })} 
                    placeholder="Contact person name"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div>
                <Label>Address</Label>
                <Textarea 
                  value={newFirm.address} 
                  onChange={(e) => setNewFirm({ ...newFirm, address: e.target.value })} 
                  placeholder="Complete firm address"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={newFirm.phone} 
                    onChange={(e) => setNewFirm({ ...newFirm, phone: e.target.value })} 
                    placeholder="Phone number"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    value={newFirm.email} 
                    onChange={(e) => setNewFirm({ ...newFirm, email: e.target.value })} 
                    placeholder="Email address"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contractor Name *</Label>
                  <Input 
                    value={newFirm.contractorName} 
                    onChange={(e) => setNewFirm({ ...newFirm, contractorName: e.target.value })} 
                    placeholder="Contractor name"
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>PAN *</Label>
                  <Input 
                    value={newFirm.pan} 
                    onChange={(e) => setNewFirm({ ...newFirm, pan: e.target.value })} 
                    placeholder="PAN number"
                    required 
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div>
                <Label>GST *</Label>
                <Input 
                  value={newFirm.gst} 
                  onChange={(e) => setNewFirm({ ...newFirm, gst: e.target.value })} 
                  placeholder="GST number"
                  required 
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowFirmDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Firm"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Contracts Dialog */}
        <Dialog open={showContractsDialog} onOpenChange={setShowContractsDialog}>
          <DialogContent className="max-w-6xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>All Contracts & LOAs</DialogTitle>
              <DialogDescription>
                View all created contracts. These LOAs are available for contractors to search in gate pass applications.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contracts by LOA number, work description, or firm name..."
                  value={contractSearchTerm}
                  onChange={(e) => setContractSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LOA Number</TableHead>
                      <TableHead>Firm Name</TableHead>
                      <TableHead>Work Description</TableHead>
                      <TableHead>Contract Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-mono text-blue-600">
                          {contract.loa_number}
                        </TableCell>
                        <TableCell>{contract.firm_name}</TableCell>
                        <TableCell>{contract.work_description}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(contract.contract_period_from)} to {formatDate(contract.contract_period_to)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={new Date(contract.contract_period_to) > new Date() ? "default" : "secondary"}>
                            {new Date(contract.contract_period_to) > new Date() ? "Active" : "Expired"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(contract.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredContracts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {contractSearchTerm ? "No contracts found matching search criteria" : "No contracts created yet"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contract Entry Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              New Contract Entry
            </CardTitle>
            <CardDescription>
              Create a new contract/LOA. Contractors will use the LOA number to apply for gate passes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loaNumber">LOA Number *</Label>
                  <Input
                    id="loaNumber"
                    value={formData.loaNumber}
                    onChange={(e) => setFormData({ ...formData, loaNumber: e.target.value })}
                    placeholder="e.g. LOA/2024/001"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>LOA Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground",
                        )}
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({ ...formData, date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workDescription">Work Description *</Label>
                <Input
                  id="workDescription"
                  value={formData.workDescription}
                  onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                  placeholder="e.g. Network AMC, Equipment Maintenance, etc."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shop/Department *</Label>
                  <Select 
                    value={formData.shopId} 
                    onValueChange={(value) => setFormData({ ...formData, shopId: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Shop" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id.toString()}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Firm *</Label>
                  <Select
                    value={formData.firmId}
                    onValueChange={(value) => {
                      const selectedFirm = firms.find((f) => f.id === value)
                      if (selectedFirm) {
                        handleFirmSelection(selectedFirm.id)
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Firm" />
                    </SelectTrigger>
                    <SelectContent>
                      {firms.map((firm) => (
                        <SelectItem key={firm.id} value={firm.id}>
                          <div>
                            <div className="font-medium">{firm.firmName}</div>
                            <div className="text-sm text-gray-500">{firm.contractorName}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Auto-filled contractor details */}
              {formData.firmName && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Auto-filled Firm Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Contractor Name</Label>
                      <p className="text-sm text-gray-600">{formData.contractorName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">PAN</Label>
                      <p className="text-sm text-gray-600">{formData.pan}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">GST</Label>
                      <p className="text-sm text-gray-600">{formData.gst}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-gray-600">{formData.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-gray-600">{formData.email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-gray-600">{formData.address}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Shift Timing */}
              <div className="space-y-2">
                <Label htmlFor="shiftTiming" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Shift Timing (LOA) *
                </Label>
                <Input
                  id="shiftTiming"
                  type="text"
                  value={formData.shiftTiming}
                  onChange={(e) => setFormData({ ...formData, shiftTiming: e.target.value })}
                  placeholder="e.g., 09:00-17:00"
                  pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-sm text-orange-600">⚠️ Note: Employee should work only 8 hours</p>
              </div>

              <div className="space-y-2">
                <Label>Contract Period *</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.contractPeriodFrom && "text-muted-foreground",
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.contractPeriodFrom ? format(formData.contractPeriodFrom, "PPP") : "From date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.contractPeriodFrom}
                          onSelect={(date) => setFormData({ ...formData, contractPeriodFrom: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.contractPeriodTo && "text-muted-foreground",
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.contractPeriodTo ? format(formData.contractPeriodTo, "PPP") : "To date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.contractPeriodTo}
                          onSelect={(date) => setFormData({ ...formData, contractPeriodTo: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* ✅ FIXED: SSE and Officer Dropdowns from Users Table */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Executing SSE *</Label>
                  <Select
                    value={formData.executingSSEId}
                    onValueChange={(value) => setFormData({ ...formData, executingSSEId: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select SSE" />
                    </SelectTrigger>
                    <SelectContent>
                      {sseUsers.length === 0 ? (
                        <SelectItem value="no-sse" disabled>
                          No SSE users found
                        </SelectItem>
                      ) : (
                        sseUsers.map((sse) => (
                          <SelectItem key={sse.id} value={String(sse.id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{sse.full_name}</span>
                              <span className="text-sm text-gray-500">
                                {sse.employee_id} • {sse.username}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {sseUsers.length === 0 && (
                    <p className="text-sm text-red-500">
                      No SSE users found. Please ensure SSE users exist in the system.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Approved Officer *</Label>
                  <Select
                    value={formData.approvedOfficerId}
                    onValueChange={(value) => setFormData({ ...formData, approvedOfficerId: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Approving Officer" />
                    </SelectTrigger>
                    <SelectContent>
                      {officerUsers.length === 0 ? (
                        <SelectItem value="no-officers" disabled>
                          No officer users found
                        </SelectItem>
                      ) : (
                        officerUsers.map((officer) => (
                          <SelectItem key={officer.id} value={String(officer.id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{officer.full_name}</span>
                              <span className="text-sm text-gray-500">
                                {officer.employee_id} • {officer.role.toUpperCase()} • {officer.username}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {officerUsers.length === 0 && (
                    <p className="text-sm text-red-500">
                      No officer users found. Please ensure Officer1/Officer2 users exist in the system.
                    </p>
                  )}
                </div>
              </div>

              {/* Debug Information */}
              {process.env.NODE_ENV === 'development' && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Debug Info</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs">
                    <p>SSE Users Loaded: {sseUsers.length}</p>
                    <p>Officer Users Loaded: {officerUsers.length}</p>
                    <p>Selected SSE ID: {formData.executingSSEId}</p>
                    <p>Selected Officer ID: {formData.approvedOfficerId}</p>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Creating Contract...
                  </>
                ) : (
                  "Create Contract/LOA Entry"
                )}
              </Button>

              {/* Info about gate pass applications */}
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  📝 Once created, contractors can search for this LOA number in the Gate Pass Application form
                </p>
                <p className="text-xs text-green-600 mt-1">
                  The LOA will be available immediately for gate pass applications
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}