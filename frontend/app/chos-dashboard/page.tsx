// app/chos-dashboard/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Eye, FileText, Mail, MessageSquare, Download, Send, LogOut, Clock, 
  CheckCircle, AlertCircle, Search, ChevronLeft, ChevronRight, RefreshCw,
  Building, Phone, User, Calendar
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Application {
  id: string
  loaNumber: string
  firmName: string
  contractorName: string
  supervisorName: string
  supervisorPhone: string
  numberOfPersons: string
  numberOfSupervisors: string
  gatePassPeriod: string
  gatePassPeriodFrom: string
  gatePassPeriodTo: string
  status: string
  rejectionReason?: string
  submittedDate: string
  updatedAt: string
  toolsItems: Array<{
    id: string
    description: string
    type: string
    quantity: string
  }>
  specialTiming: boolean
  hasInsurance: boolean
  hasEsi: boolean
  labourLicense: boolean
  interStateMigration: boolean
  contractorEmail: string
  contractorPhone: string
  contractorAddress: string
  firmPan: string
  firmGst: string
  pdfGenerated?: boolean
  sentDate?: string
  pdfFilePath?: string
}

interface TemporaryPass {
  id: number
  temp_pass_number: string
  firm_name: string
  firm_address: string
  representative_name: string
  phone_number: string
  email: string
  aadhar_number: string
  number_of_persons: number
  nature_of_work: string
  period_from: string
  period_to: string
  duration_days: number
  status: string
  officer_approval_date?: string
  officer_remarks?: string
  submitted_date: string
  pdf_generated?: boolean
  gate_permit_number?: string
}

interface User {
  id: string
  role: string
  name: string
  email: string
}

export default function ChOSDashboardPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [temporaryPasses, setTemporaryPasses] = useState<TemporaryPass[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedTempPass, setSelectedTempPass] = useState<TemporaryPass | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isTempDialogOpen, setIsTempDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showTemporaryPasses, setShowTemporaryPasses] = useState(false)
  
  // Pagination and search states for regular applications
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Get current user from session
  useEffect(() => {
    const sessionData = localStorage.getItem("user_session")
    if (sessionData) {
      const session = JSON.parse(sessionData)
      setCurrentUser({
        id: session.id,
        role: session.role || 'chos_npb',
        name: session.name,
        email: session.email
      })
    } else {
      window.location.href = "/login-selection"
    }
  }, [])

  // Fetch applications for Ch.OS/NPB role
  useEffect(() => {
    if (currentUser && currentUser.role === 'chos_npb') {
      fetchApplications()
      fetchTemporaryPasses()
    }
  }, [currentUser])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching Ch.OS/NPB applications...")
      
      const response = await fetch(`/api/applications/chos_npb?page=1&limit=100`)
      console.log("Response status:", response.status)
      
      const data = await response.json()
      console.log("Ch.OS/NPB applications data:", data)
      
      if (data.success) {
        setApplications(data.applications || [])
        console.log(`Loaded ${data.applications?.length || 0} applications for Ch.OS/NPB`)
      } else {
        throw new Error(data.error || 'Failed to fetch applications')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load applications"
      console.error("Error fetching applications:", error)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTemporaryPasses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/temporary-gate-pass?status=pending_with_chos')
      const data = await response.json()
      
      if (data.success) {
        setTemporaryPasses(data.applications || [])
        
        if (data.applications?.length > 0) {
          toast({
            title: "Temporary Passes Pending",
            description: `${data.applications.length} temporary pass(es) awaiting DSC approval`,
            className: "bg-orange-50 border-orange-200",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching temporary passes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAll = async () => {
    await Promise.all([fetchApplications(), fetchTemporaryPasses()])
    toast({
      title: "Refreshed",
      description: "All applications updated",
    })
  }

  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      setIsLoading(true)
      console.log("Fetching details for application:", applicationId)
      
      const response = await fetch(`/api/applications/details/${applicationId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch details (status: ${response.status})`)
      }
      
      const data = await response.json()
      console.log("Application details response:", data)
      
      if (!data.success || !data.application) {
        throw new Error('No application data received')
      }
      
      const app = data.application;
      
      // Parse tool_items if it's a string
      let toolsItems = [];
      if (app.tool_items) {
        try {
          toolsItems = typeof app.tool_items === 'string' 
            ? JSON.parse(app.tool_items) 
            : Array.isArray(app.tool_items) ? app.tool_items : [];
        } catch (e) {
          console.error("Error parsing tool items:", e);
          toolsItems = [];
        }
      }
      
      // Helper function to safely format dates
      const formatDateSafe = (date: any, includeTime: boolean = false) => {
        if (!date) return 'N/A';
        try {
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) return 'N/A';
          
          if (includeTime) {
            return dateObj.toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
          return dateObj.toLocaleDateString('en-IN');
        } catch {
          return date ? date.toString() : 'N/A';
        }
      };
      
      // Transform to match the Application interface
      const transformedApplication: Application = {
        id: app.id.toString(),
        loaNumber: app.loa_number || 'N/A',
        firmName: app.firm_name || 'N/A',
        contractorName: app.contractor_name || 'N/A',
        supervisorName: app.contract_supervisor_name || 'N/A',
        supervisorPhone: app.supervisor_phone || 'N/A',
        numberOfPersons: (app.number_of_persons || 0).toString(),
        numberOfSupervisors: (app.number_of_supervisors || 0).toString(),
        gatePassPeriod: `${formatDateSafe(app.gate_pass_period_from)} to ${formatDateSafe(app.gate_pass_period_to)}`,
        gatePassPeriodFrom: app.gate_pass_period_from,
        gatePassPeriodTo: app.gate_pass_period_to,
        status: app.status || 'pending_with_chos',
        rejectionReason: app.rejection_reason,
        submittedDate: formatDateSafe(app.submitted_date, true),
        updatedAt: formatDateSafe(app.updated_at),
        toolsItems: toolsItems,
        specialTiming: Boolean(app.special_timing),
        hasInsurance: Boolean(app.has_insurance),
        hasEsi: Boolean(app.has_esi),
        labourLicense: Boolean(app.labour_license),
        interStateMigration: Boolean(app.inter_state_migration),
        contractorEmail: app.contractor_email || app.email || 'N/A',
        contractorPhone: app.contractor_phone || app.phone || 'N/A',
        contractorAddress: app.contractor_address || app.address || 'N/A',
        firmPan: app.firm_pan || app.pan || 'N/A',
        firmGst: app.firm_gst || app.gst || 'N/A',
        pdfGenerated: Boolean(app.pdf_generated),
        sentDate: app.sent_date || app.email_sent_date,
        pdfFilePath: app.pdf_file_path
      };
      
      console.log("Transformed application for dialog:", transformedApplication);
      setSelectedApplication(transformedApplication)
      setIsViewDialogOpen(true)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load application details"
      console.error("Error fetching application details:", error)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewTempPass = (pass: TemporaryPass) => {
    setSelectedTempPass(pass)
    setIsTempDialogOpen(true)
  }

  const handleGeneratePDF = async (applicationId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/applications/${applicationId}/generate-pdf`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          userRole: currentUser?.role,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "PDF Generated",
          description: "Digitally signed PDF created successfully.",
        })
        
        // Update the application in the list
        setApplications(applications.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'pdf_generated', pdfGenerated: true }
            : app
        ))
        
        // Update selected application if it's the same one
        if (selectedApplication && selectedApplication.id === applicationId) {
          setSelectedApplication({
            ...selectedApplication,
            status: 'pdf_generated',
            pdfGenerated: true
          })
        }
      } else {
        toast({
          title: "Error",
          description: data?.error || 'Failed to generate PDF',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("PDF generation failed:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateTempPDF = async (passId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/temporary-gate-pass/${passId}/generate-pdf`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chos_id: currentUser?.id,
          chos_name: currentUser?.name,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "✅ Temporary Pass Generated",
          description: "PDF generated successfully.",
        })
        
        setIsTempDialogOpen(false)
        await fetchTemporaryPasses()
      } else {
        throw new Error(data.error || "Failed to generate PDF")
      }
    } catch (error) {
      console.error("Error generating temporary pass PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate temporary pass",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendToContractor = async (applicationId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          userRole: currentUser?.role,
          action: 'send-pdf',
          remarks: "Gate pass approved and sent to contractor"
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Gate Pass Sent",
          description: "Gate pass has been sent to contractor via email.",
        })
        
        const currentDate = new Date().toISOString().split('T')[0]
        setApplications(applications.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'approved', sentDate: currentDate }
            : app
        ))
        
        if (selectedApplication && selectedApplication.id === applicationId) {
          setSelectedApplication({
            ...selectedApplication,
            status: 'approved',
            sentDate: currentDate
          })
        }
      } else {
        toast({
          title: "Error",
          description: data?.error || 'Failed to send gate pass',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Failed to send gate pass:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send gate pass to contractor",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTempPass = async (passId: string, email: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/temporary-gate-pass/${passId}/send-email`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "✅ Email Sent",
          description: `Temporary pass sent to ${email}`,
        })
        
        setIsTempDialogOpen(false)
        await fetchTemporaryPasses()
      } else {
        throw new Error(data.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_with_chos":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            Ready for Processing
          </Badge>
        )
      case "pdf_generated":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <FileText className="h-3 w-3 mr-1" />
            PDF Generated & Signed
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sent to Contractor
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Filter and paginate regular applications
  const filteredApplications = applications.filter(app => 
    app.loaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.firmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.contractorName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage)

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
              <h1 className="text-2xl font-bold">Ch.OS/NPB Dashboard</h1>
              <p className="text-sm text-gray-600">Final approval, PDF generation and distribution</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={refreshAll}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="text-right">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-gray-600">Ch.OS/NPB Officer</p>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ready for Processing</CardDescription>
              <CardTitle className="text-3xl">
                {applications.filter(app => app.status === "pending_with_chos").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>PDF Generated</CardDescription>
              <CardTitle className="text-3xl">
                {applications.filter(app => app.status === "pdf_generated").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sent to Contractor</CardDescription>
              <CardTitle className="text-3xl">
                {applications.filter(app => app.status === "approved").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardDescription className="text-orange-700">Temporary Passes</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{temporaryPasses.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className="text-3xl">{applications.length + temporaryPasses.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Toggle for Temporary Passes */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-temp"
                  checked={showTemporaryPasses}
                  onCheckedChange={setShowTemporaryPasses}
                />
                <Label htmlFor="show-temp" className="font-medium cursor-pointer">
                  Show Temporary Gate Passes
                </Label>
              </div>
              {showTemporaryPasses && temporaryPasses.length > 0 && (
                <Badge className="bg-orange-100 text-orange-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {temporaryPasses.length} Priority Pass{temporaryPasses.length > 1 ? 'es' : ''}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Temporary Passes Section */}
        {showTemporaryPasses && (
          <Card className="mb-6 border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Temporary Gate Passes - Priority DSC Processing
              </CardTitle>
              <CardDescription>
                Fast-track applications requiring immediate DSC approval (Maximum 3 days)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pass Number</TableHead>
                    <TableHead>Firm Name</TableHead>
                    <TableHead>Representative</TableHead>
                    <TableHead>Nature of Work</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {temporaryPasses.map((pass) => (
                    <TableRow key={pass.id} className="bg-orange-50">
                      <TableCell className="font-mono text-orange-600">
                        {pass.temp_pass_number}
                      </TableCell>
                      <TableCell>{pass.firm_name}</TableCell>
                      <TableCell>{pass.representative_name}</TableCell>
                      <TableCell>{pass.nature_of_work}</TableCell>
                      <TableCell>
                        {format(new Date(pass.period_from), 'dd/MM/yy')} - 
                        {format(new Date(pass.period_to), 'dd/MM/yy')}
                        <Badge className="ml-2 bg-orange-100 text-orange-800">
                          {pass.duration_days} day{pass.duration_days > 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-orange-100 text-orange-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Priority DSC
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewTempPass(pass)}
                          className="border-orange-400 text-orange-600 hover:bg-orange-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {temporaryPasses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No temporary passes pending DSC approval
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Regular Applications with Search and Pagination */}
        <Card>
          <CardHeader>
            <CardTitle>Final Gate Pass Processing</CardTitle>
            <CardDescription>
              Generate PDFs, digitally sign, and send approved gate passes to contractors
            </CardDescription>
            {/* Search Bar */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by LOA number, firm name, or contractor..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading applications...</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>LOA Number</TableHead>
                        <TableHead>Firm Name</TableHead>
                        <TableHead>Contractor</TableHead>
                        <TableHead>Gate Pass Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium font-mono text-blue-600">{app.loaNumber}</TableCell>
                          <TableCell>{app.firmName}</TableCell>
                          <TableCell>{app.contractorName}</TableCell>
                          <TableCell className="font-mono text-sm">{app.gatePassPeriod}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => fetchApplicationDetails(app.id)}
                              disabled={isLoading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Process
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedApplications.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {searchTerm ? "No applications found matching your search" : "No applications ready for processing"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      {/* Page numbers */}
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Application Details Dialog - KEEPING EXISTING */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gate Pass Final Processing - {selectedApplication?.loaNumber}</DialogTitle>
              <DialogDescription>
                Digital signature, PDF generation and distribution
              </DialogDescription>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">LOA Number</h4>
                      <p className="font-mono text-blue-600">{selectedApplication.loaNumber}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Firm Name</h4>
                      <p>{selectedApplication.firmName}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Contractor Name</h4>
                      <p>{selectedApplication.contractorName}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Gate Pass Period</h4>
                      <p className="font-mono">{selectedApplication.gatePassPeriod}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Email</h4>
                      <p>{selectedApplication.contractorEmail}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Phone</h4>
                      <p>{selectedApplication.contractorPhone}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tools and Materials */}
                {selectedApplication.toolsItems && selectedApplication.toolsItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tools/Materials/Machinery/Vehicle</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedApplication.toolsItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="font-medium">{item.description}</span>
                            <div className="text-sm text-gray-600">
                              <span className="mr-4">Type: {item.type}</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Processing Actions */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* PDF Generation */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Digital Signature & PDF
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Digitally sign application and generate official gate pass PDF with all approvals
                      </p>

                      {selectedApplication.status === "pending_with_chos" && (
                        <Button 
                          onClick={() => handleGeneratePDF(selectedApplication.id)} 
                          className="w-full"
                          disabled={isLoading}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {isLoading ? "Generating..." : "Digital Sign & Generate PDF"}
                        </Button>
                      )}

                      {(selectedApplication.pdfGenerated || selectedApplication.status === "pdf_generated" || selectedApplication.status === "approved") && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">PDF Generated & Digitally Signed</span>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full bg-transparent"
                            onClick={() => {
                              window.open(`/api/applications/${selectedApplication.id}/download-pdf`, '_blank')
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Signed PDF
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Send to Contractor */}
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Send to Contractor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Send gate pass PDF to contractor via email
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">Email: {selectedApplication.contractorEmail}</span>
                        </div>
                      </div>

                      {selectedApplication.status === "pdf_generated" && (
                        <Button
                          onClick={() => handleSendToContractor(selectedApplication.id)}
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={isLoading}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isLoading ? "Sending..." : "Send via Email"}
                        </Button>
                      )}

                      {selectedApplication.status === "approved" && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Sent Successfully</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Sent on: {selectedApplication.sentDate ? formatDate(selectedApplication.sentDate) : 'N/A'}
                          </p>
                        </div>
                      )}

                      {selectedApplication.status === "pending_with_chos" && (
                        <p className="text-sm text-gray-500 text-center">
                          Generate PDF first to enable sending
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Approval Summary */}
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Approval Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <h5 className="font-semibold text-sm">SSE Approval</h5>
                          <p className="text-xs text-gray-600">Senior Section Engineer</p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <h5 className="font-semibold text-sm">Safety Officer Approval</h5>
                          <p className="text-xs text-gray-600">Safety Department</p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <h5 className="font-semibold text-sm">Officer Approval</h5>
                          <p className="text-xs text-gray-600">Technical Officer</p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg border-2 border-blue-300">
                        <div>
                          <h5 className="font-semibold text-sm">Ch.OS/NPB Final Processing</h5>
                          <p className="text-xs text-gray-600">Chief Operating Superintendent</p>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {selectedApplication.status === "pending_with_chos" ? "Processing" : 
                           selectedApplication.status === "pdf_generated" ? "PDF Ready" : "Completed"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Temporary Pass Dialog */}
        <Dialog open={isTempDialogOpen} onOpenChange={setIsTempDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge className="bg-orange-500 text-white">
                  <Clock className="h-4 w-4 mr-1" />
                  Temporary Pass
                </Badge>
                Gate Pass Final Processing - {selectedTempPass?.temp_pass_number}
              </DialogTitle>
              <DialogDescription>
                Priority DSC approval for temporary gate pass (Maximum 3 days)
              </DialogDescription>
            </DialogHeader>
            
            {selectedTempPass && (
              <div className="space-y-6">
                {/* Temporary Pass Information */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800">Temporary Pass Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Pass Number</Label>
                      <p className="font-mono text-orange-600">{selectedTempPass.temp_pass_number}</p>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <p className="font-semibold text-orange-700">
                        {selectedTempPass.duration_days} Day(s) Only
                      </p>
                    </div>
                    <div>
                      <Label>Firm Name</Label>
                      <p>{selectedTempPass.firm_name}</p>
                    </div>
                    <div>
                      <Label>Representative</Label>
                      <p>{selectedTempPass.representative_name}</p>
                    </div>
                    <div>
                      <Label>Nature of Work</Label>
                      <p>{selectedTempPass.nature_of_work}</p>
                    </div>
                    <div>
                      <Label>Number of Persons</Label>
                      <p>{selectedTempPass.number_of_persons}</p>
                    </div>
                    <div>
                      <Label>Period</Label>
                      <p>
                        {format(new Date(selectedTempPass.period_from), 'dd/MM/yyyy')} to{' '}
                        {format(new Date(selectedTempPass.period_to), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div>
                      <Label>Aadhar Number</Label>
                      <p>{selectedTempPass.aadhar_number}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label>Phone</Label>
                        <p className="font-medium">{selectedTempPass.phone_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label>Email</Label>
                        <p className="font-medium">{selectedTempPass.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-orange-50 border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Digital Signature & PDF
                      </CardTitle>
                      <CardDescription>
                        Priority DSC approval for temporary pass
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-800">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Priority Processing Required</span>
                        </div>
                      </div>
                      
                      {selectedTempPass.status === 'pending_with_chos' && (
                        <Button
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={() => handleGenerateTempPDF(selectedTempPass.id.toString())}
                          disabled={isLoading}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {isLoading ? "Generating..." : "Generate & Sign Temporary Pass"}
                        </Button>
                      )}
                      
                      {selectedTempPass.pdf_generated && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">PDF Generated & Signed</span>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => window.open(`/api/temporary-gate-pass/${selectedTempPass.id}/download-pdf`, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Signed Pass
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Send to Applicant
                      </CardTitle>
                      <CardDescription>
                        Send temporary gate pass PDF via email
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Email:</Label>
                        <p className="font-medium">{selectedTempPass.email}</p>
                      </div>
                      
                      {selectedTempPass.pdf_generated && (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleSendTempPass(selectedTempPass.id.toString(), selectedTempPass.email)}
                          disabled={isLoading}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isLoading ? "Sending..." : "Send via Email"}
                        </Button>
                      )}
                      
                      {!selectedTempPass.pdf_generated && (
                        <p className="text-sm text-gray-500 text-center">
                          Generate PDF first to enable sending
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}