"use client"

import { useState, useEffect } from "react"

import { Eye, AlertCircle, CheckCircle, XCircle, Clock, Calendar, Shield, FileText, LogOut, Users, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ApprovalHistory } from "@/components/ApprovalHistory"

interface UploadedFiles {
  main_file?: string
  factory_manager_approval?: string
  insurance_file?: string
  esi_file?: string
}

interface ToolItem {
  id?: string
  description: string
  type: string
  quantity: string
}

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
  toolsItems: ToolItem[]  // Changed: Use the ToolItem type instead of inline definition
  specialTiming: boolean
  specialTimingFrom?: string
  specialTimingTo?: string
  hasInsurance: boolean
  hasEsi: boolean
  labourLicense: boolean
  interStateMigration: boolean
  contractorEmail: string
  contractorPhone: string
  contractorAddress: string
  firmPan: string
  firmGst: string
  // Additional detailed fields
  insurance_no?: string
  insurance_persons?: string
  insurance_from?: string
  insurance_to?: string
  esi_number?: string
  esi_persons?: string
  esi_date_of_issue?: string
  license_no?: string
  employee_count?: string
  labour_remarks?: string
  migration_license_no?: string
  migration_details?: string
  migration_remarks?: string
  uploaded_files?: UploadedFiles  // Changed: Use the UploadedFiles type instead of inline definition
  workDescription?: string
  shiftTiming?: string
}

interface User {
  id: string
  role: string
  name: string
  email: string
}
// Add this at the top of your component, before the function
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
export default function SafetyOfficerDashboard() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [remarks, setRemarks] = useState("")
  const [forwardTo, setForwardTo] = useState("")
  const [modifiedFromDate, setModifiedFromDate] = useState<Date | undefined>(undefined)
  const [modifiedToDate, setModifiedToDate] = useState<Date | undefined>(undefined)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  // Add state for approval history
  const [approvalHistory, setApprovalHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [officers, setOfficers] = useState<Array<{
    id: string
    name: string
    employeeId: string
    role: string
    email: string
    displayName: string
  }>>([])

  // Add your backend URL as a constant at the top
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Helper function to view documents
  const handleViewDocument = (fileName?: string) => {
    if (fileName) {
      // Extract just the filename if it includes a path
      const justFileName = fileName.split('/').pop() || fileName;
      
      // Method 1: If using the new /view route
      window.open(`${BACKEND_URL}/api/files/view/${justFileName}`, '_blank');
      
      // Method 2: If using static file serving
      // window.open(`${BACKEND_URL}/uploads/${justFileName}`, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Document not available",
        variant: "destructive",
      });
    }
  };

  // Get current user from session
  useEffect(() => {
    const sessionData = localStorage.getItem("user_session")
    if (sessionData) {
      const session = JSON.parse(sessionData)
      setCurrentUser({
        id: session.id,
        role: session.role || 'safety_officer',
        name: session.name,
        email: session.email
      })
    } else {
      // Redirect to login if no session
      window.location.href = "/login-selection"
    }
  }, [])

  // Fetch applications for Safety Officer role
  useEffect(() => {
    if (currentUser && currentUser.role === 'safety_officer') {
      fetchApplications()
    }
  }, [currentUser])

  // Add to your useEffect to fetch officers when component mounts
  useEffect(() => {
    if (currentUser && currentUser.role === 'safety_officer') {
      fetchApplications()
      fetchOfficers() // Add this line
    }
  }, [currentUser])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/applications/safety_officer?page=1&limit=50`)
      const data = await response.json()
      
      if (data.success) {
        setApplications(data.applications || [])
      } else {
        throw new Error(data.error || 'Failed to fetch applications')
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add function to fetch approval history
  const fetchApprovalHistory = async (applicationId: string) => {
    try {
      setLoadingHistory(true)
      const response = await fetch(`/api/applications/${applicationId}/history`)
      const data = await response.json()
      
      if (data.success) {
        setApprovalHistory(data.approvalHistory)
        console.log("Approval history loaded:", data.approvalHistory)
      } else {
        console.error("Failed to fetch approval history")
        setApprovalHistory([])
      }
    } catch (error) {
      console.error("Error fetching approval history:", error)
      setApprovalHistory([])
    } finally {
      setLoadingHistory(false)
    }
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
      console.log("Full application details:", data)
      
      if (!data.success || !data.application) {
        throw new Error('No application data received')
      }
      
      const app = data.application;
      
      // Parse tool_items
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
      
      // Parse uploaded files
      let uploadedFiles = {};
      if (app.uploaded_files) {
        try {
          uploadedFiles = typeof app.uploaded_files === 'string'
            ? JSON.parse(app.uploaded_files)
            : app.uploaded_files;
        } catch (e) {
          console.error("Error parsing uploaded files:", e);
          uploadedFiles = {};
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
        status: app.status || 'pending_with_safety',
        rejectionReason: app.rejection_reason,
        submittedDate: formatDateSafe(app.submitted_date, true),
        updatedAt: formatDateSafe(app.updated_at),
        toolsItems: toolsItems,
        specialTiming: Boolean(app.special_timing),
        specialTimingFrom: app.special_timing_from,
        specialTimingTo: app.special_timing_to,
        hasInsurance: Boolean(app.has_insurance),
        hasEsi: Boolean(app.has_esi),
        labourLicense: Boolean(app.labour_license),
        interStateMigration: Boolean(app.inter_state_migration),
        contractorEmail: app.contractor_email || app.email || 'N/A',
        contractorPhone: app.contractor_phone || app.phone || 'N/A',
        contractorAddress: app.contractor_address || app.address || 'N/A',
        firmPan: app.firm_pan || app.pan || 'N/A',
        firmGst: app.firm_gst || app.gst || 'N/A',
        // All additional details
        insurance_no: app.insurance_no,
        insurance_persons: app.insurance_persons,
        insurance_from: app.insurance_from,
        insurance_to: app.insurance_to,
        esi_number: app.esi_number,
        esi_persons: app.esi_persons,
        esi_date_of_issue: app.esi_date_of_issue,
        license_no: app.license_no,
        employee_count: app.employee_count,
        labour_remarks: app.labour_remarks,
        migration_license_no: app.migration_license_no,
        migration_details: app.migration_details,
        migration_remarks: app.migration_remarks,
        uploaded_files: uploadedFiles,
        workDescription: app.work_description,
        shiftTiming: app.shift_timing
      };
      
      console.log("Transformed application with all details:", transformedApplication);
      setSelectedApplication(transformedApplication)
      await fetchApprovalHistory(applicationId)
      setIsViewDialogOpen(true)
      
    } catch (error: any) {
      console.error("Error fetching application details:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load application details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
// Add this function to fetch officers
  const fetchOfficers = async () => {
    try {
      const response = await fetch('/api/users/officers')
      const data = await response.json()
      
      if (data.success) {
        setOfficers(data.officers)
        console.log('Officers loaded:', data.officers)
      } else {
        console.error('Failed to fetch officers')
      }
    } catch (error) {
      console.error('Error fetching officers:', error)
    }
  }

  const handleApprove = async () => {
    if (!selectedApplication || !currentUser) return

    if (!forwardTo) {
      toast({
        title: "Error",
        description: "Please select an officer to forward the application to",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Get the selected officer details
      const selectedOfficer = officers.find(o => o.id === forwardTo)
      const forwardToRole = selectedOfficer?.role || forwardTo // Use role if found, otherwise use the value
      const officerName = selectedOfficer?.name || forwardTo
      
      const response = await fetch(`/api/applications/${selectedApplication.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUser.id,
          userRole: currentUser.role,
          forwardTo: forwardToRole, // Send the role (officer1 or officer2)
          forwardToUserId: forwardTo, // Send the actual user ID
          remarks: remarks || `Approved by Safety Officer and forwarded to ${officerName}` 
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({ 
          title: "Application Approved", 
          description: `Application has been approved and forwarded to ${officerName}.` 
        })
        setIsViewDialogOpen(false)
        setRemarks("")
        setForwardTo("")
        await fetchApplications() // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to approve application')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to approve application"
      console.error("Error approving application:", error)
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApplication || !currentUser) return

    if (!remarks.trim()) {
      toast({
        title: "Error",
        description: "Please provide remarks for rejection",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/applications/${selectedApplication.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUser.id,
          userRole: currentUser.role,
          remarks: remarks 
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({ 
          title: "Application Rejected", 
          description: "Application has been rejected and contractor will be notified." 
        })
        setIsViewDialogOpen(false)
        setRemarks("")
        await fetchApplications() // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to reject application')
      }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load application details'
          console.error("Error fetching application details:", error)
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      finally {
      setIsLoading(false)
    }
  }

  // Update the handleModifyPeriod function
  const handleModifyPeriod = async () => {
    if (!selectedApplication || !currentUser) return

    if (!modifiedFromDate || !modifiedToDate) {
      toast({
        title: "Error",
        description: "Please select both from and to dates",
        variant: "destructive",
      })
      return
    }

    // Validate dates
    if (modifiedFromDate >= modifiedToDate) {
      toast({
        title: "Error",
        description: "From date must be before to date",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/applications/${selectedApplication.id}/modify-period`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatePassPeriodFrom: format(modifiedFromDate, "yyyy-MM-dd"),
          gatePassPeriodTo: format(modifiedToDate, "yyyy-MM-dd"),
          safetyOfficerId: currentUser.id,
          remarks: `Modified by Safety Officer: ${currentUser.name}`
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Gate Pass Period Updated",
          description: `Updated to ${format(modifiedFromDate, "PPP")} - ${format(modifiedToDate, "PPP")}`,
        })

        // Update the selected application with new dates
        setSelectedApplication({
          ...selectedApplication,
          gatePassPeriodFrom: format(modifiedFromDate, "yyyy-MM-dd"),
          gatePassPeriodTo: format(modifiedToDate, "yyyy-MM-dd"),
          gatePassPeriod: `${format(modifiedFromDate, "dd/MM/yyyy")} to ${format(modifiedToDate, "dd/MM/yyyy")}`
        })

        // Clear the modified dates
        setModifiedFromDate(undefined)
        setModifiedToDate(undefined)
        
        // Refresh the applications list
        await fetchApplications()
      } else {
        throw new Error(data.error || 'Failed to update period')
      }
    } catch (error) {
      console.error("Error modifying period:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not update gate pass period",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_with_officer1":
      case "pending_with_officer2":
        return <Users className="h-4 w-4 text-blue-600" />
      case "rejected_by_safety":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_with_safety":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Safety Review</Badge>
      case "pending_with_officer1":
        return <Badge className="bg-blue-100 text-blue-800">Forwarded to Officer 1</Badge>
      case "pending_with_officer2":
        return <Badge className="bg-blue-100 text-blue-800">Forwarded to Officer 2</Badge>
      case "rejected_by_safety":
        return <Badge className="bg-red-100 text-red-800">Rejected by Safety</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
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

  const ViewFileButton = ({ file }: { file: { name: string; url: string; type: string } }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.open(file.url, "_blank")}
    >
      <FileText className="h-4 w-4 mr-1" />
      {file.name}
    </Button>
  )

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
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold">Safety Officer Dashboard</h1>
                <p className="text-sm text-gray-600">CWPER Gatepass Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-gray-600">Safety Officer</p>
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
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === "pending_with_safety").length}
                  </p>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status.includes("pending_with_officer")).length}
                  </p>
                  <p className="text-sm text-gray-600">Forwarded to Officers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === "rejected_by_safety").length}
                  </p>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{applications.length}</p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Gate Pass Applications</CardTitle>
            <CardDescription>Review and manage contractor gate pass applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading applications...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LOA Number</TableHead>
                      <TableHead>Firm Name</TableHead>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Gate Pass Period</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium font-mono text-blue-600">
                          {application.loaNumber}
                        </TableCell>
                        <TableCell>{application.firmName}</TableCell>
                        <TableCell>{application.contractorName}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {application.gatePassPeriod}
                        </TableCell>
                        <TableCell>{formatDate(application.submittedDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(application.status)}
                            {getStatusBadge(application.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchApplicationDetails(application.id)}
                            disabled={isLoading}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {applications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No applications found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details - {selectedApplication?.loaNumber}</DialogTitle>
              <DialogDescription>Complete information submitted by the contractor</DialogDescription>
            </DialogHeader>

            {selectedApplication && (
              <div className="space-y-6">
                        {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">LOA Number</Label>
                        <p className="text-sm text-gray-600 font-mono">
                          {selectedApplication.loaNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Firm Name</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.firmName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Contractor Name</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.contractorName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Supervisor Name</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.supervisorName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Supervisor Phone</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.supervisorPhone}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">No. of Persons</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.numberOfPersons}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">No. of Supervisors</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.numberOfSupervisors}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Gate Pass Period</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.gatePassPeriod}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.contractorEmail}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Work Description</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.workDescription || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              {/* Special Timing Information */}
              {selectedApplication.specialTiming && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Special Timing Request</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">From Time</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.specialTimingFrom || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">To Time</Label>
                        <p className="text-sm text-gray-600">{selectedApplication.specialTimingTo || 'N/A'}</p>
                      </div>
                      {selectedApplication.uploaded_files?.factory_manager_approval && (
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium">Factory Manager Approval</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(selectedApplication?.uploaded_files?.factory_manager_approval)}
                            className="mt-2"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Approval Document
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Insurance Information */}
              {selectedApplication.hasInsurance && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Insurance Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Insurance Number</Label>
                      <p className="text-sm text-gray-600 font-mono">{selectedApplication.insurance_no || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Number of Persons Covered</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.insurance_persons || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Insurance Valid From</Label>
                      <p className="text-sm text-gray-600">
                        {selectedApplication.insurance_from ? new Date(selectedApplication.insurance_from).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Insurance Valid To</Label>
                      <p className="text-sm text-gray-600">
                        {selectedApplication.insurance_to ? new Date(selectedApplication.insurance_to).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </div>
                    {selectedApplication.uploaded_files?.insurance_file && (
                      <div className="md:col-span-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(selectedApplication?.uploaded_files?.insurance_file)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Insurance Document
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ESI Information */}
              {selectedApplication.hasEsi && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg">ESI Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">ESI Number</Label>
                      <p className="text-sm text-gray-600 font-mono">{selectedApplication.esi_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Number of Persons Covered</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.esi_persons || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Date of Issue</Label>
                      <p className="text-sm text-gray-600">
                        {selectedApplication.esi_date_of_issue ? new Date(selectedApplication.esi_date_of_issue).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </div>
                    {selectedApplication.uploaded_files?.esi_file && (
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(selectedApplication?.uploaded_files?.esi_file)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View ESI Document
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Labour License Information */}
              {(selectedApplication.labourLicense || selectedApplication.license_no) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Labour License Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">License Number</Label>
                      <p className="text-sm text-gray-600 font-mono">{selectedApplication.license_no || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Employee Count</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.employee_count || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Labour Remarks</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.labour_remarks || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Migration Information */}
              {(selectedApplication.interStateMigration || selectedApplication.migration_license_no) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Inter-State Migration Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Migration License Number</Label>
                      <p className="text-sm text-gray-600 font-mono">{selectedApplication.migration_license_no || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Migration Details</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.migration_details || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Migration Remarks</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.migration_remarks || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tools and Materials */}
              {selectedApplication.toolsItems && selectedApplication.toolsItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tools/Materials/Machinery/Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedApplication.toolsItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <Badge variant="outline">{item.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Documents */}
              {selectedApplication.uploaded_files?.main_file && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(selectedApplication?.uploaded_files?.main_file)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Additional Document
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Compliance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Uploaded Documents Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedApplication?.uploaded_files?.factory_manager_approval && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Factory Manager Approval</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(selectedApplication?.uploaded_files?.factory_manager_approval)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      )}
                      {selectedApplication?.uploaded_files?.insurance_file && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Insurance Certificate</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(selectedApplication?.uploaded_files?.insurance_file)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      )}
                      {selectedApplication?.uploaded_files?.esi_file && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">ESI Certificate</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(selectedApplication?.uploaded_files?.esi_file)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      )}
                      {selectedApplication?.uploaded_files?.main_file && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Additional Document</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(selectedApplication?.uploaded_files?.main_file)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      )}
                      {!selectedApplication?.uploaded_files?.factory_manager_approval && 
                      !selectedApplication?.uploaded_files?.insurance_file && 
                      !selectedApplication?.uploaded_files?.esi_file && 
                      !selectedApplication?.uploaded_files?.main_file && (
                        <p className="text-sm text-gray-500 text-center py-4">No documents uploaded</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Modify Gate Pass Period - Enhanced UI */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Modify Gate Pass Period (Optional)
                    </CardTitle>
                    <CardDescription>
                      Adjust the gate pass validity period if needed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Show current period */}
                    <div className="p-3 bg-white rounded-lg border">
                      <Label className="text-sm font-medium text-gray-600">Current Period</Label>
                      <p className="font-mono text-sm mt-1">
                        {selectedApplication.gatePassPeriod}
                      </p>
                    </div>

                    {/* New period selection */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>New From Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !modifiedFromDate && "text-muted-foreground",
                              )}
                              disabled={isLoading}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {modifiedFromDate ? format(modifiedFromDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={modifiedFromDate}
                              onSelect={setModifiedFromDate}
                              initialFocus
                              disabled={(date) => {
                                // Disable past dates
                                return date < new Date(new Date().setHours(0,0,0,0))
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <Label>New To Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !modifiedToDate && "text-muted-foreground",
                              )}
                              disabled={isLoading}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {modifiedToDate ? format(modifiedToDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={modifiedToDate}
                              onSelect={setModifiedToDate}
                              initialFocus
                              disabled={(date) => {
                                // Disable dates before the selected from date
                                return modifiedFromDate ? date <= modifiedFromDate : false
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Show what will change */}
                    {modifiedFromDate && modifiedToDate && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium text-sm">Period will be changed to:</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1 font-mono">
                          {format(modifiedFromDate, "dd/MM/yyyy")} to {format(modifiedToDate, "dd/MM/yyyy")}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleModifyPeriod}
                      disabled={!modifiedFromDate || !modifiedToDate || isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Updating Period...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Update Period
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* In your Application Details Dialog, add this after Basic Information */}

                  {/* Approval History - Add this right after Basic Information Card */}
                  {approvalHistory.length > 0 && (
                    <ApprovalHistory 
                      history={approvalHistory} 
                      loaNumber={selectedApplication?.loaNumber}
                    />
                  )}
                {/* Action Buttons */}
                {selectedApplication.status === "pending_with_safety" && (
                  <div className="space-y-4">
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Safety Officer Review</CardTitle>
                        <CardDescription>
                          Approve and forward to an officer, or reject the application
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="forwardTo" className="font-medium">
                            Forward To (Required for Approval)
                          </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={fetchOfficers}
                                type="button"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                          <Select value={forwardTo} onValueChange={setForwardTo}>
                            <SelectTrigger className="w-full mt-2">
                              <SelectValue placeholder="Select officer to forward to" />
                            </SelectTrigger>
                            <SelectContent>
                              {officers.length > 0 ? (
                                officers.map((officer) => (
                                  <SelectItem key={officer.id} value={officer.id}>
                                    {officer.displayName}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="officer1">Officer 1 (Default)</SelectItem>
                                  <SelectItem value="officer2">Officer 2 - Factory Manager (Default)</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          {officers.length === 0 && (
                            <p className="text-xs text-yellow-600 mt-1">
                              No officers found in database. Using default options.
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="remarks" className="font-medium">Remarks (Required for rejection)</Label>
                          <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter remarks if rejecting the application..."
                            rows={3}
                            className="mt-2"
                          />
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button
                            onClick={handleApprove}
                            disabled={isLoading || !forwardTo}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isLoading ? "Processing..." : "Approve & Forward"}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isLoading}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {isLoading ? "Processing..." : "Reject Application"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Application Status */}
                {selectedApplication.status !== "pending_with_safety" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedApplication.status)}
                        <span className="text-sm text-gray-600">
                          Last updated: {formatDate(selectedApplication.updatedAt)}
                        </span>
                      </div>
                      {selectedApplication.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                          <Label className="font-medium text-red-700">Rejection Reason:</Label>
                          <p className="text-red-600 mt-1">{selectedApplication.rejectionReason}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}