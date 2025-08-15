// app/officer-dashboard/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ApprovalHistory } from "@/components/ApprovalHistory"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Eye, Check, X, Clock, FileSignature, AlertCircle, LogOut, FileText, Users,
  Building, Phone, Mail, User, Calendar, RefreshCw
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
  forward_to_user_id: number
  forward_to_role: string
  forward_to_name: string
  status: string
  current_officer_id: number
  officer_name?: string
  submitted_date: string
  updated_at: string
}

interface User {
  id: string
  role: string
  name: string
  email: string
}

export default function OfficerDashboardPage() {
  const { toast } = useToast()
  const [officer1Applications, setOfficer1Applications] = useState<Application[]>([])
  const [officer2Applications, setOfficer2Applications] = useState<Application[]>([])
  const [temporaryPasses, setTemporaryPasses] = useState<TemporaryPass[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedTempPass, setSelectedTempPass] = useState<TemporaryPass | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isTempDialogOpen, setIsTempDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTempPasses, setLoadingTempPasses] = useState(false)
  const [remarks, setRemarks] = useState("")
  const [tempRemarks, setTempRemarks] = useState("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("officer1")
  const [approvalHistory, setApprovalHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showTemporaryPasses, setShowTemporaryPasses] = useState(false)

  // Get current user from session
  useEffect(() => {
    const sessionData = localStorage.getItem("user_session")
    if (sessionData) {
      const session = JSON.parse(sessionData)
      setCurrentUser({
        id: session.id,
        role: session.role || 'officer1',
        name: session.name,
        email: session.email
      })
      
      if (session.role === 'officer2') {
        setActiveTab("officer2")
      }
    } else {
      window.location.href = "/login-selection"
    }
  }, [])

  // Fetch applications for Officer roles
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'officer1' || currentUser.role === 'admin') {
        fetchOfficer1Applications()
      }
      if (currentUser.role === 'officer2' || currentUser.role === 'admin') {
        fetchOfficer2Applications()
      }
      
      // Always fetch temporary passes for officers
      if (currentUser.role === 'officer1' || currentUser.role === 'officer2') {
        fetchTemporaryPasses()
      }
    }
  }, [currentUser])

  const fetchOfficer1Applications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/applications/officer1?page=1&limit=50`)
      const data = await response.json()
      
      if (data.success) {
        // Filter out temporary passes from regular applications
        const regularApps = (data.applications || []).filter(
          (app: Application) => !app.loaNumber.startsWith('TEMP/')
        )
        setOfficer1Applications(regularApps)
      }
    } catch (error) {
      console.error("Error fetching Officer 1 applications:", error)
      toast({
        title: "Error",
        description: "Failed to load Officer 1 applications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOfficer2Applications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/applications/officer2?page=1&limit=50`)
      const data = await response.json()
      
      if (data.success) {
        // Filter out temporary passes from regular applications
        const regularApps = (data.applications || []).filter(
          (app: Application) => !app.loaNumber.startsWith('TEMP/')
        )
        setOfficer2Applications(regularApps)
      }
    } catch (error) {
      console.error("Error fetching Officer 2 applications:", error)
      toast({
        title: "Error",
        description: "Failed to load Officer 2 applications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTemporaryPasses = async () => {
    try {
      setLoadingTempPasses(true)
      
      if (!currentUser) return
      
      const statusFilter = currentUser.role === 'officer1' 
        ? 'pending_with_officer1' 
        : 'pending_with_officer2'
      
      const response = await fetch(
        `/api/temporary-gate-pass?status=${statusFilter}&officer_id=${currentUser.id}&page=1&limit=50`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.applications) {
          setTemporaryPasses(data.applications)
          
          if (data.applications.length > 0) {
            toast({
              title: "Temporary Passes Found",
              description: `${data.applications.length} temporary gate pass(es) require attention`,
              className: "bg-orange-50 border-orange-200",
            })
          }
        }
      }
    } catch (error) {
      console.error("Error fetching temporary passes:", error)
    } finally {
      setLoadingTempPasses(false)
    }
  }

  const refreshAllApplications = async () => {
    await Promise.all([
      currentUser?.role === 'officer1' && fetchOfficer1Applications(),
      currentUser?.role === 'officer2' && fetchOfficer2Applications(),
      fetchTemporaryPasses()
    ])
    
    toast({
      title: "Refreshed",
      description: "All applications updated successfully",
    })
  }

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

  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/applications/details/${applicationId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch details`)
      }
      
      const data = await response.json()
      
      if (!data.success || !data.application) {
        throw new Error('No application data received')
      }
      
      const app = data.application;
      
      // Parse tool_items if needed
      let toolsItems = [];
      if (app.tool_items) {
        try {
          toolsItems = typeof app.tool_items === 'string' 
            ? JSON.parse(app.tool_items) 
            : Array.isArray(app.tool_items) ? app.tool_items : [];
        } catch (e) {
          toolsItems = [];
        }
      }
      
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
        status: app.status || 'pending_with_officer1',
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
        firmGst: app.firm_gst || app.gst || 'N/A'
      };
      
      setSelectedApplication(transformedApplication)
      await fetchApprovalHistory(applicationId)
      setIsViewDialogOpen(true)
      
    } catch (error) {
      console.error("Error fetching application details:", error)
      toast({
        title: "Error",
        description: "Failed to load application details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewTempPass = (tempPass: TemporaryPass) => {
    setSelectedTempPass(tempPass)
    setIsTempDialogOpen(true)
    setTempRemarks("")
  }

  const handleApproveTempPass = async () => {
    if (!selectedTempPass || !currentUser) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/temporary-gate-pass/${selectedTempPass.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_id: currentUser.id,
          officer_name: currentUser.name,
          remarks: tempRemarks || `Approved by ${currentUser.role}`,
          role: currentUser.role,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "✅ Temporary Pass Approved",
          description: "Application forwarded to Ch.OS/NPB for final processing",
        })
        
        setIsTempDialogOpen(false)
        await fetchTemporaryPasses()
      } else {
        throw new Error(data.error || "Approval failed")
      }
    } catch (error) {
      console.error("Error approving temporary pass:", error)
      toast({
        title: "Error",
        description: "Failed to approve temporary pass",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectTempPass = async () => {
    if (!selectedTempPass || !currentUser || !tempRemarks.trim()) {
      toast({
        title: "Error",
        description: "Please provide rejection reason",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/temporary-gate-pass/${selectedTempPass.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_id: currentUser.id,
          officer_name: currentUser.name,
          rejection_reason: tempRemarks,
          role: currentUser.role,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Temporary Pass Rejected",
          description: "The application has been rejected",
          variant: "destructive",
        })
        
        setIsTempDialogOpen(false)
        await fetchTemporaryPasses()
      } else {
        throw new Error(data.error || "Rejection failed")
      }
    } catch (error) {
      console.error("Error rejecting temporary pass:", error)
      toast({
        title: "Error",
        description: "Failed to reject temporary pass",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (officerType: 'officer1' | 'officer2') => {
    if (!selectedApplication || !currentUser) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/applications/${selectedApplication.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUser.id,
          userRole: officerType,
          remarks: remarks || `Approved by ${officerType.toUpperCase()}` 
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        const message = officerType === 'officer1' 
          ? "Application has been approved and forwarded to Officer 2 (Factory Manager)."
          : "Application has been approved and forwarded to Ch.OS/NPB for final DSC approval.";
          
        toast({ 
          title: "Application Approved", 
          description: message
        })
        setIsViewDialogOpen(false)
        setRemarks("")
        
        if (officerType === 'officer1') {
          await fetchOfficer1Applications()
        } else {
          await fetchOfficer2Applications()
        }
      } else {
        throw new Error(data.error || 'Failed to approve application')
      }
    } catch (error) {
      console.error("Error approving application:", error)
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (officerType: 'officer1' | 'officer2') => {
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
          userRole: officerType,
          remarks: remarks 
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({ 
          title: "Application Rejected", 
          description: `Application has been rejected by ${officerType.toUpperCase()} and contractor will be notified.` 
        })
        setIsViewDialogOpen(false)
        setRemarks("")
        
        if (officerType === 'officer1') {
          await fetchOfficer1Applications()
        } else {
          await fetchOfficer2Applications()
        }
      } else {
        throw new Error(data.error || 'Failed to reject application')
      }
    } catch (error) {
      console.error("Error rejecting application:", error)
      toast({ 
        title: "Error", 
        description: "Failed to reject application", 
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
      case "pending_with_officer1":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending Officer 1 Review
          </Badge>
        )
      case "pending_with_officer2":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending Officer 2 Review
          </Badge>
        )
      case "pending_with_chos":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Users className="h-3 w-3 mr-1" />
            With Ch.OS/NPB
          </Badge>
        )
      case "rejected_by_officer":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <X className="h-3 w-3 mr-1" />
            Rejected by Officer
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

  const renderApplicationsTable = (applications: Application[], officerType: 'officer1' | 'officer2') => (
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
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium font-mono text-blue-600">
                {app.loaNumber}
              </TableCell>
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
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {applications.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No pending applications for {officerType === 'officer1' ? 'Officer 1' : 'Officer 2'} review
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  const renderTemporaryPassesTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pass Number</TableHead>
            <TableHead>Firm Name</TableHead>
            <TableHead>Representative</TableHead>
            <TableHead>Nature of Work</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {temporaryPasses.map((pass) => (
            <TableRow key={pass.id} className="bg-orange-50">
              <TableCell className="font-medium font-mono text-orange-600">
                {pass.temp_pass_number}
              </TableCell>
              <TableCell>{pass.firm_name}</TableCell>
              <TableCell>{pass.representative_name}</TableCell>
              <TableCell>{pass.nature_of_work}</TableCell>
              <TableCell className="font-mono text-sm">
                {format(new Date(pass.period_from), 'dd/MM/yy')} - 
                {format(new Date(pass.period_to), 'dd/MM/yy')}
              </TableCell>
              <TableCell>
                <Badge className="bg-orange-100 text-orange-800">
                  {pass.duration_days} day{pass.duration_days > 1 ? 's' : ''}
                </Badge>
              </TableCell>
              <TableCell>{getStatusBadge(pass.status)}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewTempPass(pass)}
                  disabled={isLoading}
                  className="border-orange-400 text-orange-600 hover:bg-orange-50"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {temporaryPasses.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No temporary gate passes pending review
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
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
            <div>
              <h1 className="text-2xl font-bold">Officer Dashboard</h1>
              <p className="text-sm text-gray-600">Review and approve applications with DSC</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={refreshAllApplications}
                variant="outline"
                size="sm"
                disabled={isLoading || loadingTempPasses}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || loadingTempPasses) ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="text-right">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-gray-600 capitalize">{currentUser.role.replace('_', ' ')}</p>
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
              <CardDescription>Officer 1 Pending</CardDescription>
              <CardTitle className="text-3xl">{officer1Applications.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Officer 2 Pending</CardDescription>
              <CardTitle className="text-3xl">{officer2Applications.length}</CardTitle>
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
              <CardDescription>Total Pending</CardDescription>
              <CardTitle className="text-3xl">
                {officer1Applications.length + officer2Applications.length + temporaryPasses.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Processed Today</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Toggle for Temporary Passes */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="temp-passes"
                  checked={showTemporaryPasses}
                  onCheckedChange={setShowTemporaryPasses}
                />
                <Label htmlFor="temp-passes" className="font-medium cursor-pointer">
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
                Temporary Gate Passes (Priority)
              </CardTitle>
              <CardDescription>
                Fast-track applications for urgent work (Maximum 3 days)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingTempPasses ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
                  <p>Loading temporary passes...</p>
                </div>
              ) : (
                renderTemporaryPassesTable()
              )}
            </CardContent>
          </Card>
        )}

        {/* Regular Applications */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${currentUser.role === 'officer1' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {(currentUser.role === 'officer1' || currentUser.role === 'admin') && (
              <TabsTrigger value="officer1">Officer 1 Approvals</TabsTrigger>
            )}
            {(currentUser.role === 'officer2' || currentUser.role === 'admin') && (
              <TabsTrigger value="officer2">Officer 2 (Factory Manager)</TabsTrigger>
            )}
          </TabsList>

          {(currentUser.role === 'officer1' || currentUser.role === 'admin') && (
            <TabsContent value="officer1">
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading Officer 1 applications...</p>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Officer 1 - Initial Approval</CardTitle>
                    <CardDescription>
                      Review and approve applications with Digital Signature Certificate (DSC)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderApplicationsTable(officer1Applications, 'officer1')}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {(currentUser.role === 'officer2' || currentUser.role === 'admin') && (
            <TabsContent value="officer2">
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading Officer 2 applications...</p>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Officer 2 - Factory Manager Final Approval</CardTitle>
                    <CardDescription>
                      Final review and approval of applications with Digital Signature Certificate (DSC)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderApplicationsTable(officer2Applications, 'officer2')}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Temporary Pass Details Dialog */}
        <Dialog open={isTempDialogOpen} onOpenChange={setIsTempDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge className="bg-orange-500 text-white">
                  <Clock className="h-4 w-4 mr-1" />
                  Temporary Pass
                </Badge>
                {selectedTempPass?.temp_pass_number}
              </DialogTitle>
              <DialogDescription>
                Priority processing required - Maximum 3 days validity
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
                      <p className="font-semibold">{selectedTempPass.duration_days} Day(s)</p>
                    </div>
                    <div>
                      <Label>Nature of Work</Label>
                      <p>{selectedTempPass.nature_of_work}</p>
                    </div>
                    <div>
                      <Label>Number of Persons</Label>
                      <p>{selectedTempPass.number_of_persons}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Firm Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Firm Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Firm Name</Label>
                        <p className="font-medium">{selectedTempPass.firm_name}</p>
                      </div>
                      <div>
                        <Label>Representative</Label>
                        <p className="font-medium">{selectedTempPass.representative_name}</p>
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <p className="font-medium">{selectedTempPass.firm_address}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Details</CardTitle>
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
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label>Aadhar Number</Label>
                        <p className="font-medium">{selectedTempPass.aadhar_number}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Period */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Gate Pass Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>From Date</Label>
                      <p className="font-medium">
                        {format(new Date(selectedTempPass.period_from), 'PPP')}
                      </p>
                    </div>
                    <div>
                      <Label>To Date</Label>
                      <p className="font-medium">
                        {format(new Date(selectedTempPass.period_to), 'PPP')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Approval Section */}
                <Card className="bg-orange-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileSignature className="h-5 w-5" />
                      Officer Approval (Priority)
                    </CardTitle>
                    <CardDescription>
                      After approval, this will be forwarded to Ch.OS/NPB for final DSC signing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-orange-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="text-sm text-orange-800">
                        This is a priority temporary pass. Process immediately.
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tempRemarks">Remarks (Required for rejection)</Label>
                      <Textarea
                        id="tempRemarks"
                        value={tempRemarks}
                        onChange={(e) => setTempRemarks(e.target.value)}
                        placeholder="Enter remarks..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleApproveTempPass}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {isLoading ? "Processing..." : "Approve & Forward to Ch.OS/NPB"}
                      </Button>
                      <Button
                        onClick={handleRejectTempPass}
                        disabled={isLoading || !tempRemarks.trim()}
                        variant="destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {isLoading ? "Processing..." : "Reject Application"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Regular Application Details Dialog - Keep existing code */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Keep all existing application dialog content as is */}
            <DialogHeader>
              <DialogTitle>Officer Review - {selectedApplication?.loaNumber}</DialogTitle>
              <DialogDescription>
                Review application and approve with Digital Signature Certificate
              </DialogDescription>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                {/* Keep all existing cards and sections for regular applications */}
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">LOA Number</Label>
                      <p className="font-mono text-blue-600">{selectedApplication.loaNumber}</p>
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
                      <Label className="font-medium">Gate Pass Period</Label>
                      <p className="font-mono">{selectedApplication.gatePassPeriod}</p>
                    </div>
                    <div>
                      <Label className="font-medium">No. of Persons</Label>
                      <p>{selectedApplication.numberOfPersons}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Supervisor</Label>
                      <p>{selectedApplication.supervisorName}</p>
                      <p className="text-sm text-gray-600">{selectedApplication.supervisorPhone}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Approval History */}
                {loadingHistory ? (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <Clock className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading approval history...</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : approvalHistory.length > 0 ? (
                  <ApprovalHistory 
                    history={approvalHistory} 
                    loaNumber={selectedApplication?.loaNumber}
                  />
                ) : null}

                {/* Tools and Materials */}
                {selectedApplication.toolsItems && selectedApplication.toolsItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tools/Materials/Machinery</CardTitle>
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

                {/* DSC Approval Section */}
                {(selectedApplication.status === "pending_with_officer1" || selectedApplication.status === "pending_with_officer2") && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileSignature className="h-5 w-5" />
                        {selectedApplication.status === "pending_with_officer1" 
                          ? "Officer 1 Approval"
                          : "Officer 2 (Factory Manager) Approval"}
                      </CardTitle>
                      <CardDescription>
                        {selectedApplication.status === "pending_with_officer1" 
                          ? "Review and forward to Officer 2"
                          : "Review and forward to Ch.OS/NPB for final DSC approval"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <span className="text-sm">
                          {selectedApplication.status === "pending_with_officer1" 
                            ? "After approval, this will be forwarded to Officer 2"
                            : "After approval, this will be forwarded to Ch.OS/NPB for final DSC signing"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="officerRemarks">Remarks (Optional)</Label>
                        <Textarea
                          id="officerRemarks"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Enter any remarks or conditions..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(
                            selectedApplication.status === "pending_with_officer1" ? 'officer1' : 'officer2'
                          )}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          {isLoading ? "Processing..." : 
                            selectedApplication.status === "pending_with_officer1" 
                              ? "Approve & Forward to Officer 2"
                              : "Approve & Forward to Ch.OS/NPB"}
                        </Button>
                        <Button
                          onClick={() => handleReject(
                            selectedApplication.status === "pending_with_officer1" ? 'officer1' : 'officer2'
                          )}
                          disabled={isLoading || !remarks.trim()}
                          variant="destructive"
                        >
                          <X className="h-4 w-4 mr-2" />
                          {isLoading ? "Processing..." : "Reject Application"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Application Status */}
                {!selectedApplication.status.includes("pending_with_officer") && (
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