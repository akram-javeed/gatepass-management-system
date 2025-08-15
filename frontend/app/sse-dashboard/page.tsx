"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ApprovalHistory } from "@/components/ApprovalHistory"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, Check, X, Clock, LogOut, FileText, Users, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  workDescription?: string
  shiftTiming?: string
  assignedSSE?: string
  sseEmployeeId?: string
  // Additional fields for details
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
}

interface User {
  id: string
  role: string
  name: string
  email: string
}

export default function SSEDashboardPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [remarks, setRemarks] = useState("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [approvalHistory, setApprovalHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  // Get current user from session
  useEffect(() => {
    const sessionData = localStorage.getItem("user_session")
    if (sessionData) {
      const session = JSON.parse(sessionData)
      setCurrentUser({
        id: session.id,
        role: session.role || 'sse',
        name: session.name,
        email: session.email
      })
    } else {
      // Redirect to login if no session
      window.location.href = "/login-selection"
    }
  }, [])

  // Fetch applications assigned to this specific SSE user
  useEffect(() => {
    if (currentUser && currentUser.role === 'sse' && currentUser.id) {
      console.log("Current user ready, fetching SSE applications:", {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role
      });
      fetchApplications()
    }
  }, [currentUser])

  const fetchApplications = async () => {
    if (!currentUser?.id) {
      console.log("No current user ID available");
      return;
    }

    try {
      setIsLoading(true)
      console.log("Fetching applications for SSE user ID:", currentUser.id)
      
      // Use the SSE-specific endpoint
      const response = await fetch(`/api/applications/sse/${currentUser.id}?page=1&limit=50`)
      const data = await response.json()
      
      console.log("SSE applications response:", {
        success: data.success,
        applicationsCount: data.applications?.length || 0,
        sseUser: data.sseUser,
        error: data.error
      })
      
      if (data.success) {
        setApplications(data.applications || [])
        
        if (data.applications && data.applications.length > 0) {
          console.log(`Successfully loaded ${data.applications.length} applications assigned to SSE user ${currentUser.id}`)
        } else {
          console.log("No applications found for this SSE user")
        }
      } else {
        throw new Error(data.error || 'Failed to fetch SSE applications')
      }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load assigned applications"
        console.error("Error fetching SSE applications:", error)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        setApplications([])
      } finally {
      setIsLoading(false)
    }
  }

  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      setIsLoading(true)
      console.log("Fetching details for application:", applicationId)
      
      const response = await fetch(`/api/applications/details/${applicationId}`)
      console.log("Response status:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch details (status: ${response.status})`)
      }
      
      const data = await response.json()
      console.log("Response data:", data)
      
      if (!data.success || !data.application) {
        throw new Error('No application data received')
      }
      
      const app = data.application;
      
      console.log("Application firm details:", {
        firm_id: app.firm_id,
        firm_name: app.firm_name,
        contractor_name: app.contractor_name
      });
      
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
          // Simple date format: DD/MM/YYYY
          return dateObj.toLocaleDateString('en-IN');
        } catch {
          return date.toString();
        }
      };
      
      const transformedApplication: Application = {
        id: app.id.toString(),
        loaNumber: app.loa_number || 'N/A',
        // Use the firm details from the joined query
        firmName: app.firm_name || 'N/A',
        contractorName: app.contractor_name || 'N/A',
        supervisorName: app.contract_supervisor_name || 'N/A',
        supervisorPhone: app.supervisor_phone || 'N/A',
        numberOfPersons: (app.number_of_persons || 0).toString(),
        numberOfSupervisors: (app.number_of_supervisors || 0).toString(),
        // Format gate pass period as simple dates
        gatePassPeriod: `${formatDateSafe(app.gate_pass_period_from)} to ${formatDateSafe(app.gate_pass_period_to)}`,
        gatePassPeriodFrom: app.gate_pass_period_from,
        gatePassPeriodTo: app.gate_pass_period_to,
        status: app.status || 'pending_with_sse',
        rejectionReason: app.rejection_reason,
        // Format submitted date with time
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
        contractorEmail: app.contractor_email || 'N/A',
        contractorPhone: app.contractor_phone || 'N/A',
        contractorAddress: app.contractor_address || 'N/A',
        firmPan: app.firm_pan || 'N/A',
        firmGst: app.firm_gst || 'N/A',
        workDescription: app.work_description || 'N/A',
        shiftTiming: app.shift_timing || 'N/A',
        assignedSSE: app.sse_name || currentUser?.name || 'N/A',
        sseEmployeeId: app.sse_employee_id || 'N/A',
        // Additional compliance fields
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
        migration_remarks: app.migration_remarks
      };
      
      console.log("Transformed application:", transformedApplication);
      setSelectedApplication(transformedApplication)
      await fetchApprovalHistory(applicationId)
      setIsViewDialogOpen(true)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load application details"
      console.error("Error in fetchApplicationDetails:", error)
      toast({
        title: "Error Loading Details",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add the same fetchApprovalHistory function
  const fetchApprovalHistory = async (applicationId: string) => {
    try {
      setLoadingHistory(true)
      const response = await fetch(`/api/applications/${applicationId}/history`)
      const data = await response.json()
      
      if (data.success) {
        setApprovalHistory(data.approvalHistory)
      } else {
        setApprovalHistory([])
      }
    } catch (error) {
      console.error("Error fetching approval history:", error)
      setApprovalHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedApplication || !currentUser) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/applications/${selectedApplication.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUser.id,
          userRole: currentUser.role,
          remarks: remarks || "Approved by SSE" 
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({ 
          title: "Application Approved", 
          description: "Application has been approved and forwarded to Safety Officer." 
        })
        setIsViewDialogOpen(false)
        setRemarks("")
        await fetchApplications()
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
        await fetchApplications()
      } else {
        throw new Error(data.error || 'Failed to reject application')
      }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to reject application"
        console.error("Error rejecting application:", error)
        toast({ 
          title: "Error", 
          description: errorMessage, 
          variant: "destructive" 
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
      case 'pending_with_sse':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'pending_with_safety':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Users className="h-3 w-3 mr-1" />
            With Safety Officer
          </Badge>
        )
      case 'rejected_by_sse':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <X className="h-3 w-3 mr-1" />
            Rejected by SSE
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
              <h1 className="text-2xl font-bold text-gray-900">SSE Dashboard</h1>
              <p className="text-sm text-gray-600">Senior Section Engineer - Gate Pass Management</p>
              <p className="text-xs text-blue-600 mt-1">
                Showing applications assigned to: <strong>{currentUser.name}</strong>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchApplications}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="text-right">
                <p className="font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-sm text-gray-600">Southern Railway CWPER</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
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
          {["Pending Review", "Approved", "Rejected", "Total Assigned"].map((label) => {
            const count = label === "Pending Review"
              ? applications.filter(app => app.status === "pending_with_sse").length
              : label === "Approved"
              ? applications.filter(app => app.status === "pending_with_safety").length
              : label === "Rejected"
              ? applications.filter(app => app.status === "rejected_by_sse").length
              : applications.length

            return (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <CardDescription>{label}</CardDescription>
                  <CardTitle className="text-3xl">{count}</CardTitle>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>My Assigned Gate Pass Applications</span>
              <Badge variant="outline" className="text-blue-600">
                User ID: {currentUser.id}
              </Badge>
            </CardTitle>
            <CardDescription>
              Applications from LOAs where you are assigned as the executing SSE
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading your assigned applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Applications Assigned</h3>
                <p className="text-gray-500 mb-4">
                  No gate pass applications have been submitted for LOAs where you are the executing SSE.
                </p>
                <Button 
                  variant="outline" 
                  onClick={fetchApplications}
                  className="mt-4"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Again
                </Button>
              </div>
            ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">App ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">LOA Number</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Firm Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Contractor</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Supervisor</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Gate Pass Period</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Submitted</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-600">
                          #{app.id}
                        </td>
                        <td className="px-4 py-3 font-medium font-mono text-blue-600">
                          {app.loaNumber}
                        </td>
                        <td className="px-4 py-3">{app.firmName || 'N/A'}</td>
                        <td className="px-4 py-3">{app.contractorName || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{app.supervisorName}</div>
                            <div className="text-sm text-gray-500">{app.supervisorPhone}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{app.gatePassPeriod}</td>
                        <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(app.submittedDate)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchApplicationDetails(app.id)}
                            disabled={isLoading}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Application Details Dialog - Continue in next message due to length */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Review - {selectedApplication?.loaNumber}</DialogTitle>
              <DialogDescription>
                Complete gate pass application details and SSE review
              </DialogDescription>
            </DialogHeader>

            {selectedApplication && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">LOA Number</Label>
                      <p className="text-blue-600 font-mono">{selectedApplication.loaNumber}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Firm Name</Label>
                      <p>{selectedApplication.firmName}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Contractor Name</Label>
                      <p>{selectedApplication.contractorName}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Supervisor Name</Label>
                      <p>{selectedApplication.supervisorName}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Supervisor Phone</Label>
                      <p>{selectedApplication.supervisorPhone}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Gate Pass Period</Label>
                      <p>{selectedApplication.gatePassPeriod}</p>
                    </div>
                    <div>
                      <Label className="font-medium">No. of Persons</Label>
                      <p>{selectedApplication.numberOfPersons}</p>
                    </div>
                    <div>
                      <Label className="font-medium">No. of Supervisors</Label>
                      <p>{selectedApplication.numberOfSupervisors}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tools/Materials/Machinery */}
                {selectedApplication.toolsItems && selectedApplication.toolsItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tools/Materials/Machinery</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
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

                {/* Compliance Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Special Timing:</Label>
                      <Badge variant={selectedApplication.specialTiming ? "default" : "secondary"}>
                        {selectedApplication.specialTiming ? "Yes" : "No"}
                      </Badge>
                      {selectedApplication.specialTiming && selectedApplication.specialTimingFrom && (
                        <span className="text-sm text-gray-600">
                          ({selectedApplication.specialTimingFrom} - {selectedApplication.specialTimingTo})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Insurance:</Label>
                      <Badge variant={selectedApplication.hasInsurance ? "default" : "secondary"}>
                        {selectedApplication.hasInsurance ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">ESI:</Label>
                      <Badge variant={selectedApplication.hasEsi ? "default" : "secondary"}>
                        {selectedApplication.hasEsi ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Labour License:</Label>
                      <Badge variant={selectedApplication.labourLicense ? "default" : "secondary"}>
                        {selectedApplication.labourLicense ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                  {approvalHistory.length > 0 && (
                    <ApprovalHistory 
                      history={approvalHistory} 
                      loaNumber={selectedApplication?.loaNumber}
                    />
                  )}
                {/* SSE Actions */}
                {selectedApplication.status === "pending_with_sse" && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        SSE Review Required
                      </CardTitle>
                      <CardDescription>
                        Please review and approve or reject this application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="remarks" className="font-medium">Remarks (Optional for approval, Required for rejection)</Label>
                        <Textarea
                          id="remarks"
                          placeholder="Add your remarks here..."
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          className="w-full mt-2"
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={handleApprove}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          {isLoading ? "Processing..." : "Approve & Forward to Safety"}
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={isLoading || !remarks.trim()}
                        >
                          <X className="mr-2 h-4 w-4" />
                          {isLoading ? "Processing..." : "Reject Application"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Application Status */}
                {selectedApplication.status !== "pending_with_sse" && (
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