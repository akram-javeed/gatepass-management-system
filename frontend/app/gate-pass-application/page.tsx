"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, ArrowLeft, Plus, Trash2, Upload, Search, Clock, X, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ToolItem {
  id: string
  description: string
  type: string
  quantity: string
}

interface Supervisor {
  id: string
  name: string
  phone: string
}

// ENHANCED: Contract data interface with all fields including SSE info
interface ContractData {
  id: string
  loa_number: string
  contract_start_date: string
  contract_end_date: string
  work_description: string
  shift_timing: string
  // Firm information  
  firm_id: string
  firm_name: string
  firm_contractor_name: string
  firm_pan: string
  firm_gst: string
  firm_phone: string
  firm_email: string
  firm_address: string
  // SSE information
  sse_id: string
  sse_name: string
  sse_employee_id: string
  sse_email: string
  // Officer information
  officer_id: string
  officer_name: string
  officer_employee_id: string
  officer_role: string
}

// Debounce utility function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

export default function GatePassApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // LOA Search States
  const [fullLOADatabase, setFullLOADatabase] = useState<ContractData[]>([])
  const [loaSearchTerm, setLoaSearchTerm] = useState("")
  const [selectedLOA, setSelectedLOA] = useState("")
  const [filteredContracts, setFilteredContracts] = useState<ContractData[]>([])
  const [showLOADropdown, setShowLOADropdown] = useState(false)
  const [contractInfo, setContractInfo] = useState<ContractData | null>(null)
  const [searchAttempted, setSearchAttempted] = useState(false)
  
  // Form States
  const [firmId, setFirmId] = useState("")
  const [migrationDetails, setMigrationDetails] = useState("")
  const [migrationRemarks, setMigrationRemarks] = useState("")
  const [specialTiming, setSpecialTiming] = useState(false)
  const [fromTime, setFromTime] = useState("")
  const [toTime, setToTime] = useState("")
  const [factoryApprovalFile, setFactoryApprovalFile] = useState<File | null>(null)
  const [insuranceDates, setInsuranceDates] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({ from: undefined, to: undefined })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    numberOfPersons: "",
    numberOfSupervisors: "",
    gatePassPeriodFrom: undefined as Date | undefined,
    gatePassPeriodTo: undefined as Date | undefined,
    uploadedFile: null as File | null,
  })

  // Multiple supervisors state
  const [supervisors, setSupervisors] = useState<Supervisor[]>([{ id: "1", name: "", phone: "" }])

  // Labour License state
  const [labourLicense, setLabourLicense] = useState({
    labourLicenseNo: "",
    migrationLicenseNo: "",
  })

  // Insurance state
  const [insurance, setInsurance] = useState({
    hasInsurance: false,
    insuranceNo: "",
    insurancePersons: "",
    insuranceFile: null as File | null,
  })

  // ESI state
  const [esi, setEsi] = useState({
    hasEsi: false,
    esiNumber: "",
    numberOfPersons: "",
    file: null as File | null,
    esiDateOfIssue: null as Date | null,
  })

  const [toolItems, setToolItems] = useState<ToolItem[]>([{ id: "1", description: "", type: "", quantity: "" }])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      if (searchTerm.trim() === "") {
        setFilteredContracts([])
        setShowLOADropdown(false)
      } else {
        const filtered = fullLOADatabase
          .filter((loa) => loa.loa_number.toLowerCase().includes(searchTerm.toLowerCase()))
          .slice(0, 5)
        setFilteredContracts(filtered)
        setShowLOADropdown(filtered.length > 0)
      }
    }, 300),
    [fullLOADatabase]
  )

  // FIXED: Load contracts with complete information including SSE details
  useEffect(() => {
    async function fetchContracts() {
      try {
        console.log("Fetching contracts with search parameter...")
        const res = await fetch("/api/contracts")
        if (!res.ok) throw new Error("Failed to load contracts")
        
        const data = await res.json()
        console.log("Contracts loaded:", data.length, "contracts")
        console.log("Sample contract data:", data[0])
        
        // Transform the data to ensure all fields are properly mapped
        const transformedData = data.map((contract: any) => ({
          id: contract.id,
          loa_number: contract.loa_number,
          contract_start_date: contract.contract_period_from,
          contract_end_date: contract.contract_period_to,
          work_description: contract.work_description,
          shift_timing: contract.shift_timing,
          // Firm information
          firm_id: contract.firm_id || contract.firm_firm_id || '',
          firm_name: contract.firm_name,
          firm_contractor_name: contract.contractor_name,
          firm_pan: contract.pan,
          firm_gst: contract.gst,
          firm_phone: contract.phone,
          firm_email: contract.email,
          firm_address: contract.address,
          // SSE information
          sse_id: contract.executing_sse_id,
          sse_name: contract.sse_name,
          sse_employee_id: contract.sse_employee_id || "N/A",
          sse_email: contract.sse_email || "N/A",
          // Officer information
          officer_id: contract.approved_officer_id,
          officer_name: contract.officer_name,
          officer_employee_id: contract.officer_employee_id || "N/A",
          officer_role: contract.officer_role || "Officer"
        }))
        console.log("Sample transformed contract:", transformedData[0])
        
        setFullLOADatabase(transformedData)
      } catch (err) {
        console.error("Error loading contracts", err)
        toast({
          title: "Error",
          description: "Unable to fetch contract list.",
          variant: "destructive",
        })
      }
    }
    fetchContracts()
  }, [toast])

  // Handle LOA search input
  const handleLOASearch = (value: string) => {
    setLoaSearchTerm(value)
    setSearchAttempted(false)
    debouncedSearch(value)

    if (value !== selectedLOA) {
      setSelectedLOA("")
      setContractInfo(null)
    }
  }

  // ENHANCED: Handle LOA selection with complete auto-fill
  const handleLOASelection = (selectedData: ContractData) => {
    console.log("Selected contract:", selectedData)
    console.log("Selected contract firm_id:", selectedData.firm_id)
    
    setSelectedLOA(selectedData.loa_number)
    setLoaSearchTerm(selectedData.loa_number)
    setShowLOADropdown(false)
    setContractInfo(selectedData)
    setFirmId(selectedData.firm_id || selectedData.id) 
    setSearchAttempted(true)
    
    toast({
      title: "LOA Selected",
      description: `Contract details loaded for ${selectedData.loa_number}`,
    })
  }

  // ENHANCED: Search LOA function with proper API call
  const searchLOA = async () => {
    if (!loaSearchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter LOA number",
        variant: "destructive",
      })
      return
    }

    setSearchAttempted(true)
    setContractInfo(null)

    try {
      console.log("Searching for LOA:", loaSearchTerm)
      
      // Search in the loaded database first
      const foundContract = fullLOADatabase.find(
        contract => contract.loa_number.toLowerCase() === loaSearchTerm.toLowerCase().trim()
      )

      if (foundContract) {
        setContractInfo(foundContract)
        setSelectedLOA(foundContract.loa_number)
        setFirmId(foundContract.firm_id)
        
        toast({
          title: "LOA Found",
          description: `Contract details loaded for ${foundContract.loa_number}`,
        })
      } else {
        // If not found in loaded data, try API search
        const response = await fetch(`/api/contracts?search=${encodeURIComponent(loaSearchTerm.trim())}`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data && data.length > 0) {
            const contract = data[0]
            handleLOASelection(contract)
          } else {
            toast({
              title: "LOA Not Found",
              description: "Please check the LOA number and try again.",
              variant: "destructive",
            })
          }
        } else {
          const error = await response.json()
          toast({
            title: "Search Error",
            description: error.message || "Error searching LOA",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Error searching LOA:', error)
      toast({
        title: "Search Error",
        description: "Error searching LOA. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Clear LOA selection
  const clearLOASelection = () => {
    setLoaSearchTerm("")
    setSelectedLOA("")
    setShowLOADropdown(false)
    setContractInfo(null)
    setFirmId("")
    setSearchAttempted(false)
  }

  // Supervisor functions
  const addSupervisor = () => {
    const newSupervisor: Supervisor = {
      id: Date.now().toString(),
      name: "",
      phone: "",
    }
    setSupervisors([...supervisors, newSupervisor])
  }

  const removeSupervisor = (id: string) => {
    setSupervisors(supervisors.filter((supervisor) => supervisor.id !== id))
  }

  const updateSupervisor = (id: string, field: keyof Supervisor, value: string) => {
    setSupervisors(
      supervisors.map((supervisor) => (supervisor.id === id ? { ...supervisor, [field]: value } : supervisor))
    )
  }

  // Tool item functions
  const addToolItem = () => {
    const newItem: ToolItem = {
      id: Date.now().toString(),
      description: "",
      type: "",
      quantity: "",
    }
    setToolItems([...toolItems, newItem])
  }

  const removeToolItem = (id: string) => {
    setToolItems(toolItems.filter((item) => item.id !== id))
  }

  const updateToolItem = (id: string, field: keyof ToolItem, value: string) => {
    setToolItems(toolItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "insurance" | "esi") => {
    const file = e.target.files?.[0]
    if (file) {
      switch (type) {
        case "main":
          setFormData({ ...formData, uploadedFile: file })
          break
        case "insurance":
          setInsurance({ ...insurance, insuranceFile: file })
          break
        case "esi":
          setEsi({ ...esi, file: file })
          break
      }
    }
  }

  // Form submission handler with updated workflow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return // Prevent double submission

    if (!selectedLOA || !contractInfo) {
      toast({
        title: "Error",
        description: "Please select a valid LOA",
        variant: "destructive",
      })
      return
    }

    // Validate dates
    if (!formData.gatePassPeriodFrom || !formData.gatePassPeriodTo) {
      toast({
        title: "Error",
        description: "Please select gate pass period dates",
        variant: "destructive",
      })
      return
    }

    // Validate supervisors
    if (!supervisors[0].name || !supervisors[0].phone) {
      toast({
        title: "Error",
        description: "Please fill in supervisor details",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare form data
      const formDataToSend = new FormData()
      
      // CRITICAL: Send LOA number first
      formDataToSend.append("loa_number", selectedLOA)
      
      // Send supervisors as JSON
      formDataToSend.append("supervisors", JSON.stringify(supervisors))
      
      // IMPORTANT: Send primary supervisor for backward compatibility (REQUIRED)
      formDataToSend.append("contract_supervisor_name", supervisors[0].name)
      formDataToSend.append("supervisor_phone", supervisors[0].phone)
      
      // Gate pass dates (REQUIRED)
      formDataToSend.append(
        "gate_pass_period_from", 
        format(formData.gatePassPeriodFrom, "yyyy-MM-dd")
      )
      formDataToSend.append(
        "gate_pass_period_to", 
        format(formData.gatePassPeriodTo, "yyyy-MM-dd")
      )
      
      // Number of persons and supervisors
      formDataToSend.append("number_of_persons", formData.numberOfPersons || "0")
      formDataToSend.append("number_of_supervisors", formData.numberOfSupervisors || supervisors.length.toString())
      
      // Special timing
      formDataToSend.append("special_timing", specialTiming ? "true" : "false")
      if (specialTiming) {
        formDataToSend.append("special_timing_from", fromTime || "")
        formDataToSend.append("special_timing_to", toTime || "")
        if (factoryApprovalFile) {
          formDataToSend.append("factory_manager_approval_file", factoryApprovalFile)
        }
      } else {
        // Send empty values when special timing is false
        formDataToSend.append("special_timing_from", "")
        formDataToSend.append("special_timing_to", "")
      }
      
      // Labour license - Calculate based on number of persons
      const numberOfPersonsInt = parseInt(formData.numberOfPersons) || 0
      const showLabourLicense = numberOfPersonsInt > 20
      const showMigrationLicense = numberOfPersonsInt > 4
      
      formDataToSend.append("labour_license", showLabourLicense ? "true" : "false")
      formDataToSend.append("license_no", labourLicense.labourLicenseNo || "")
      formDataToSend.append("employee_count", formData.numberOfPersons || "0")
      formDataToSend.append("labour_remarks", "")
      
      // Migration
      formDataToSend.append("inter_state_migration", showMigrationLicense ? "true" : "false")
      formDataToSend.append("migration_license_no", labourLicense.migrationLicenseNo || "")
      formDataToSend.append("migration_details", migrationDetails || "")
      formDataToSend.append("migration_remarks", migrationRemarks || "")
      
      // Insurance
      formDataToSend.append("has_insurance", insurance.hasInsurance ? "true" : "false")
      if (insurance.hasInsurance) {
        formDataToSend.append("insurance_no", insurance.insuranceNo || "")
        formDataToSend.append("insurance_persons", insurance.insurancePersons || "")
        formDataToSend.append("insurance_from", insuranceDates.from ? format(insuranceDates.from, "yyyy-MM-dd") : "")
        formDataToSend.append("insurance_to", insuranceDates.to ? format(insuranceDates.to, "yyyy-MM-dd") : "")
        if (insurance.insuranceFile) {
          formDataToSend.append("insurance_file", insurance.insuranceFile)
        }
      } else {
        // Send empty values when no insurance
        formDataToSend.append("insurance_no", "")
        formDataToSend.append("insurance_persons", "")
        formDataToSend.append("insurance_from", "")
        formDataToSend.append("insurance_to", "")
      }
      
      // ESI
      formDataToSend.append("has_esi", esi.hasEsi ? "true" : "false")
      if (esi.hasEsi) {
        formDataToSend.append("esi_number", esi.esiNumber || "")
        formDataToSend.append("esi_persons", esi.numberOfPersons || "")
        formDataToSend.append("esi_date_of_issue", esi.esiDateOfIssue ? format(esi.esiDateOfIssue, "yyyy-MM-dd") : "")
        if (esi.file) {
          formDataToSend.append("esi_file", esi.file)
        }
      } else {
        // Send empty values when no ESI
        formDataToSend.append("esi_number", "")
        formDataToSend.append("esi_persons", "")
        formDataToSend.append("esi_date_of_issue", "")
      }
      
      // Tool items - Always send as JSON string
      const toolItemsToSend = toolItems.filter(item => item.description && item.quantity)
      formDataToSend.append("tool_items", JSON.stringify(toolItemsToSend))
      
      // Main file upload (optional)
      if (formData.uploadedFile) {
        formDataToSend.append("uploadedFile", formData.uploadedFile)
      }

      console.log("Submitting application with LOA:", selectedLOA)
      console.log("Number of supervisors:", supervisors.length)
      console.log("Primary supervisor:", supervisors[0])

      const response = await fetch("/api/gatepass", {
        method: "POST",
        body: formDataToSend,
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log("Success result:", result)
        
        toast({
          title: "✅ Application Submitted Successfully!",
          description: `Your gate pass application has been submitted. Application ID: ${result.application?.id}`,
        })

        // Show email notification if email exists
        if (contractInfo?.firm_email) {
          setTimeout(() => {
            toast({
              title: "📧 Email Notification",
              description: `Confirmation email will be sent to ${contractInfo.firm_email}`,
            })
          }, 1000)
        }

        // Redirect to confirmation page with application details
        const redirectUrl = `/confirmation?id=${result.application?.id || 'unknown'}&loa=${result.application?.loa_number || selectedLOA}&status=${result.application?.status || 'pending_with_sse'}&date=${result.application?.submitted_date || new Date().toISOString()}`
        
        console.log("Redirecting to:", redirectUrl)
        
        // Small delay for better UX
        setTimeout(() => {
          router.push(redirectUrl)
        }, 2000)

      } else {
        // Error handling
        let errorMessage = `Request failed with status ${response.status}`;
        let errorData = null;
        
        try {
          const responseText = await response.text();
          console.log("Error response text:", responseText);
          
          if (responseText) {
            try {
              errorData = JSON.parse(responseText);
              console.log("Parsed error data:", errorData);
              
              // Extract error message
              if (errorData.error) {
                errorMessage = errorData.error;
              } else if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.details) {
                errorMessage = errorData.details;
              }
              
              // Handle missing required fields
              if (errorData.required && Array.isArray(errorData.required)) {
                errorMessage = `Missing required fields: ${errorData.required.join(', ')}`;
                
                // Log what we're sending vs what's required
                console.log("Required fields:", errorData.required);
                console.log("Received fields:", errorData.received);
              }
            } catch (jsonError) {
              console.log("Could not parse as JSON:", responseText);
              errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`;
            }
          }
        } catch (textError) {
          console.error("Could not read response text:", textError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Submission error:", error)
      
      let errorMessage = "An unexpected error occurred while submitting your application";
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Network error - Unable to connect to the server. Please check your connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Show user-friendly error message
      toast({
        title: "❌ Submission Failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      // Log detailed error for debugging
      console.error("Detailed submission error:", {
        error,
        message: errorMessage,
        type: error?.constructor?.name,
        stack: error?.stack
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate if labour license fields should show
  const numberOfPersonsInt = Number.parseInt(formData.numberOfPersons) || 0
  const showLabourLicense = numberOfPersonsInt > 20
  const showMigrationLicense = numberOfPersonsInt > 4

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Gate Pass Application</h1>
        </div>

        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Contractor Gate Pass Application Form</CardTitle>
            <CardDescription>
              Fill out this form to apply for a contractor gate pass. Your application will be reviewed by SSE, Safety Officer, and Technical Officers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* LOA Search Input */}
              <div className="space-y-2 relative">
                <Label>LOA Number *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search LOA Number..."
                    value={loaSearchTerm}
                    onChange={(e) => handleLOASearch(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isSubmitting}
                    onKeyPress={(e) => e.key === 'Enter' && searchLOA()}
                  />
                  {loaSearchTerm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={clearLOASelection}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Search Button */}
                <Button
                  type="button"
                  onClick={searchLOA}
                  disabled={isSubmitting || !loaSearchTerm.trim()}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search LOA
                </Button>

                {/* Search Results Dropdown */}
                {showLOADropdown && filteredContracts.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                    <ul className="max-h-60 overflow-y-auto">
                      {filteredContracts.map((contract) => (
                        <li
                          key={contract.id}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleLOASelection(contract)}
                        >
                          <div className="font-medium">{contract.loa_number}</div>
                          {contract.work_description && (
                            <div className="text-sm text-gray-600">{contract.work_description}</div>
                          )}
                          <div className="text-xs text-gray-500">{contract.firm_name}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* No Results Message */}
                {searchAttempted && !contractInfo && (
                  <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50">
                    <p className="text-red-800">❌ LOA number not found. Please check the number and try again.</p>
                  </div>
                )}

                {!loaSearchTerm && (
                  <div className="text-xs text-gray-500 mt-1">
                    💡 Start typing LOA number to search from database (e.g., LOA/2024/001)
                  </div>
                )}
              </div>

              {/* ENHANCED: Auto-filled Contract Information with SSE Details */}
              {contractInfo && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Contract Information (Auto-filled)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Selected LOA</Label>
                      <p className="text-sm text-gray-900 font-semibold">{contractInfo.loa_number}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Contract Period</Label>
                      <p className="text-sm text-gray-900">
                        {new Date(contractInfo.contract_start_date).toLocaleDateString()} to{' '}
                        {new Date(contractInfo.contract_end_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Firm Name</Label>
                      <p className="text-sm text-gray-900">{contractInfo.firm_name}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Contractor Name</Label>
                      <p className="text-sm text-gray-900">{contractInfo.firm_contractor_name || 'Not specified'}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">PAN</Label>
                      <p className="text-sm text-gray-900">{contractInfo.firm_pan}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">GST</Label>
                      <p className="text-sm text-gray-900">{contractInfo.firm_gst}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-gray-900">{contractInfo.firm_phone}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-gray-900">{contractInfo.firm_email}</p>
                    </div>

                    {/* NEW: Executing SSE Information */}
                    <div>
                      <Label className="text-sm font-medium">Executing SSE</Label>
                      <p className="text-sm text-gray-900">
                        {contractInfo.sse_name} ({contractInfo.sse_employee_id})
                      </p>
                    </div>

                    {contractInfo.shift_timing && (
                      <div className="md:col-span-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-orange-500 mr-1" />
                          <Label className="text-sm font-medium">Shift Timing</Label>
                        </div>
                        <p className="text-sm text-orange-600 font-medium">
                          ⚠️ Employee should work only {contractInfo.shift_timing}
                        </p>
                      </div>
                    )}

                    <div className="md:col-span-3">
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-gray-900">{contractInfo.firm_address}</p>
                    </div>

                    {contractInfo.work_description && (
                      <div className="md:col-span-3">
                        <Label className="text-sm font-medium">Work Description</Label>
                        <p className="text-sm text-gray-900">{contractInfo.work_description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Main Application Form - Only show if LOA is found */}
              {contractInfo && (
                <>
                  {/* Multiple Supervisors Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Supervisor Details</CardTitle>
                          <CardDescription>Add all supervisors who will be responsible</CardDescription>
                        </div>
                        <Button type="button" onClick={addSupervisor} size="sm" disabled={isSubmitting}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Supervisor
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {supervisors.map((supervisor, index) => (
                          <div key={supervisor.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="flex-1 grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`supervisor-name-${supervisor.id}`}>Supervisor {index + 1} Name *</Label>
                                <Input
                                  id={`supervisor-name-${supervisor.id}`}
                                  value={supervisor.name}
                                  onChange={(e) => updateSupervisor(supervisor.id, "name", e.target.value)}
                                  placeholder="Enter supervisor name"
                                  required
                                  disabled={isSubmitting}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`supervisor-phone-${supervisor.id}`}>Supervisor {index + 1} Phone *</Label>
                                <Input
                                  id={`supervisor-phone-${supervisor.id}`}
                                  type="tel"
                                  value={supervisor.phone}
                                  onChange={(e) => updateSupervisor(supervisor.id, "phone", e.target.value)}
                                  placeholder="10-digit phone number"
                                  pattern="[0-9]{10}"
                                  maxLength={10}
                                  required
                                  disabled={isSubmitting}
                                />
                              </div>
                            </div>
                            {supervisors.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSupervisor(supervisor.id)}
                                className="text-red-600 hover:text-red-700"
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numberOfPersons">No. of Persons *</Label>
                      <Input
                        id="numberOfPersons"
                        type="number"
                        value={formData.numberOfPersons}
                        onChange={(e) => setFormData({ ...formData, numberOfPersons: e.target.value })}
                        placeholder="Total number of persons"
                        min="1"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numberOfSupervisors">No. of Supervisors *</Label>
                      <Input
                        id="numberOfSupervisors"
                        type="number"
                        value={formData.numberOfSupervisors}
                        onChange={(e) => setFormData({ ...formData, numberOfSupervisors: e.target.value })}
                        placeholder="Number of supervisors"
                        min="1"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Gate Pass Period */}
                  <div className="space-y-2">
                    <Label>Gate Pass Period *</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">From Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.gatePassPeriodFrom && "text-muted-foreground",
                              )}
                              disabled={isSubmitting}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.gatePassPeriodFrom ? format(formData.gatePassPeriodFrom, "PPP") : "From date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.gatePassPeriodFrom}
                              onSelect={(date) => setFormData({ ...formData, gatePassPeriodFrom: date })}
                              initialFocus
                              disabled={isSubmitting}
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
                                !formData.gatePassPeriodTo && "text-muted-foreground",
                              )}
                              disabled={isSubmitting}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.gatePassPeriodTo ? format(formData.gatePassPeriodTo, "PPP") : "To date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.gatePassPeriodTo}
                              onSelect={(date) => setFormData({ ...formData, gatePassPeriodTo: date })}
                              initialFocus
                              disabled={isSubmitting}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Special Timing Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="specialTiming"
                          checked={specialTiming}
                          onCheckedChange={(checked) => setSpecialTiming(checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="specialTiming">Special Timing</Label>
                      </div>

                      {specialTiming && (
                        <div className="space-y-4 pl-6 border-l-2 border-yellow-300">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>From Time (24h)</Label>
                              <Input
                                type="time"
                                value={fromTime}
                                onChange={(e) => setFromTime(e.target.value)}
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>To Time (24h)</Label>
                              <Input
                                type="time"
                                value={toTime}
                                onChange={(e) => setToTime(e.target.value)}
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Factory Manager Approval Copy (PDF)</Label>
                            <Input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) setFactoryApprovalFile(file)
                              }}
                              disabled={isSubmitting}
                            />
                            {factoryApprovalFile && <p className="text-sm">{factoryApprovalFile.name}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tools/Materials/Machinery/Vehicle Table */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Tools/Materials/Machinery/Vehicle</Label>
                      <Button type="button" onClick={addToolItem} size="sm" disabled={isSubmitting}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="w-16">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {toolItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Input
                                  value={item.description}
                                  onChange={(e) => updateToolItem(item.id, "description", e.target.value)}
                                  placeholder="Item description"
                                  disabled={isSubmitting}
                                />
                              </TableCell>
                              <TableCell>
                                <Select 
                                  value={item.type} 
                                  onValueChange={(value) => updateToolItem(item.id, "type", value)}
                                  disabled={isSubmitting}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Tools">Tools</SelectItem>
                                    <SelectItem value="Material">Material</SelectItem>
                                    <SelectItem value="Machine">Machine</SelectItem>
                                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.quantity}
                                  onChange={(e) => updateToolItem(item.id, "quantity", e.target.value)}
                                  placeholder="Quantity"
                                  disabled={isSubmitting}
                                />
                              </TableCell>
                              <TableCell>
                                {toolItems.length > 1 && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeToolItem(item.id)}
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Labour License Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Labour License Information</CardTitle>
                      <CardDescription>Required based on number of personnel</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {showLabourLicense && (
                        <div className="space-y-2">
                          <Label htmlFor="labourLicenseNo">Labour Commission License No (Required: Labours &gt; 20)</Label>
                          <Input
                            id="labourLicenseNo"
                            value={labourLicense.labourLicenseNo}
                            onChange={(e) => setLabourLicense({ ...labourLicense, labourLicenseNo: e.target.value })}
                            placeholder="Labour license number"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      )}

                      {showMigrationLicense && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="migrationLicenseNo">
                              Inter-state Migration License No (Required: Labours &gt; 4)
                            </Label>
                            <Input
                              id="migrationLicenseNo"
                              value={labourLicense.migrationLicenseNo}
                              onChange={(e) => setLabourLicense({ ...labourLicense, migrationLicenseNo: e.target.value })}
                              placeholder="Migration license number"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="migrationDetails">Migration Details</Label>
                            <Input
                              id="migrationDetails"
                              value={migrationDetails}
                              onChange={(e) => setMigrationDetails(e.target.value)}
                              placeholder="Migration details"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="migrationRemarks">Migration Remarks</Label>
                            <Input
                              id="migrationRemarks"
                              value={migrationRemarks}
                              onChange={(e) => setMigrationRemarks(e.target.value)}
                              placeholder="Remarks"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      )}

                      {!showLabourLicense && !showMigrationLicense && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="labourLicenseNo">Labour Commission License No</Label>
                            <Input
                              id="labourLicenseNo"
                              value={labourLicense.labourLicenseNo}
                              onChange={(e) => setLabourLicense({ ...labourLicense, labourLicenseNo: e.target.value })}
                              placeholder="Enter labour license number"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="migrationLicenseNo">Inter-state Migration License No</Label>
                            <Input
                              id="migrationLicenseNo"
                              value={labourLicense.migrationLicenseNo}
                              onChange={(e) => setLabourLicense({ ...labourLicense, migrationLicenseNo: e.target.value })}
                              placeholder="Migration license number"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="migrationDetails">Migration Details</Label>
                            <Input
                              id="migrationDetails"
                              value={migrationDetails}
                              onChange={(e) => setMigrationDetails(e.target.value)}
                              placeholder="Migration details"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="migrationRemarks">Migration Remarks</Label>
                            <Input
                              id="migrationRemarks"
                              value={migrationRemarks}
                              onChange={(e) => setMigrationRemarks(e.target.value)}
                              placeholder="Remarks"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Insurance Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Insurance Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasInsurance"
                          checked={insurance.hasInsurance}
                          onCheckedChange={(checked) => setInsurance({ ...insurance, hasInsurance: checked as boolean })}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="hasInsurance">Insurance</Label>
                      </div>

                      {insurance.hasInsurance && (
                        <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="insuranceNo">Insurance No</Label>
                              <Input
                                id="insuranceNo"
                                value={insurance.insuranceNo}
                                onChange={(e) => setInsurance({ ...insurance, insuranceNo: e.target.value })}
                                placeholder="Insurance number"
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="insurancePersons">No. of Persons</Label>
                              <Input
                                id="insurancePersons"
                                type="number"
                                value={insurance.insurancePersons}
                                onChange={(e) => setInsurance({ ...insurance, insurancePersons: e.target.value })}
                                placeholder="Number of insured persons"
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label>Insurance From Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left" disabled={isSubmitting}>
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {insuranceDates.from ? format(insuranceDates.from, "PPP") : "From date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={insuranceDates.from}
                                      onSelect={(date) => setInsuranceDates({ ...insuranceDates, from: date })}
                                      disabled={isSubmitting}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div>
                                <Label>Insurance To Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left" disabled={isSubmitting}>
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {insuranceDates.to ? format(insuranceDates.to, "PPP") : "To date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={insuranceDates.to}
                                      onSelect={(date) => setInsuranceDates({ ...insuranceDates, to: date })}
                                      disabled={isSubmitting}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                            <Label htmlFor="insuranceFileUpload">Upload Insurance File</Label>
                            <div className="flex items-center gap-4">
                              <Input
                                id="insuranceFileUpload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(e, "insurance")}
                                className="hidden"
                                disabled={isSubmitting}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("insuranceFileUpload")?.click()}
                                disabled={isSubmitting}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Choose File
                              </Button>
                              {insurance.insuranceFile && (
                                <span className="text-sm text-gray-600">{insurance.insuranceFile.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* ESI Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>ESI Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <Label className="block font-medium">ESI Coverage *</Label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="hasEsi"
                              value="yes"
                              checked={esi.hasEsi === true}
                              onChange={() => setEsi({ ...esi, hasEsi: true })}
                              disabled={isSubmitting}
                            />
                            Yes
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="hasEsi"
                              value="no"
                              checked={esi.hasEsi === false}
                              onChange={() =>
                                setEsi({
                                  hasEsi: false,
                                  esiNumber: "",
                                  numberOfPersons: "",
                                  file: null,
                                  esiDateOfIssue: null,
                                })
                              }
                              disabled={isSubmitting}
                            />
                            No
                          </label>
                        </div>

                        {esi.hasEsi && (
                          <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                            {/* ESI Number */}
                            <div className="space-y-1">
                              <Label htmlFor="esiNumber">ESI Number</Label>
                              <Input
                                id="esiNumber"
                                value={esi.esiNumber}
                                onChange={(e) => setEsi({ ...esi, esiNumber: e.target.value })}
                                required
                                disabled={isSubmitting}
                              />
                            </div>

                            {/* Number of Persons */}
                            <div className="space-y-1">
                              <Label htmlFor="esiPersons">Number of Persons Covered</Label>
                              <Input
                                id="esiPersons"
                                type="number"
                                value={esi.numberOfPersons}
                                onChange={(e) => setEsi({ ...esi, numberOfPersons: e.target.value })}
                                required
                                disabled={isSubmitting}
                              />
                            </div>

                            {/* ESI Document Upload */}
                            <div className="space-y-1">
                              <Label htmlFor="esiUpload">Upload ESI Copy</Label>
                              <Input
                                id="esiUpload"
                                type="file"
                                accept="application/pdf,image/*"
                                onChange={(e) => setEsi({ ...esi, file: e.target.files?.[0] || null })}
                                disabled={isSubmitting}
                              />
                            </div>

                            {/* Date of Issue */}
                            <div className="space-y-1">
                              <Label>Date of Issue</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start text-left" disabled={isSubmitting}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {esi.esiDateOfIssue ? format(esi.esiDateOfIssue, "PPP") : "Select date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={esi.esiDateOfIssue ?? undefined}
                                    onSelect={(date) => setEsi({ ...esi, esiDateOfIssue: date || null })}
                                    disabled={isSubmitting}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Main File Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="fileUpload">Upload File (PDF or Image)</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="fileUpload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) setFormData({ ...formData, uploadedFile: file })
                            }}
                            className="hidden"
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("fileUpload")?.click()}
                            disabled={isSubmitting}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                          {formData.uploadedFile && (
                            <span className="text-sm text-gray-600">{formData.uploadedFile.name}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button - Updated with loading state */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting || !contractInfo}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      "Submit Gate Pass Application"
                    )}
                  </Button>

                  {/* Submission Info */}
                  {contractInfo?.firm_email && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        📧 Confirmation email will be sent to: <strong>{contractInfo.firm_email}</strong>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Your application will be reviewed by SSE → Safety Officer → Technical Officers → Ch.OS/NPB
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* No LOA Selected Message */}
              {!contractInfo && searchAttempted && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <div className="text-yellow-600 mb-2">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">LOA Number Required</h3>
                  <p className="text-yellow-700">
                    Please search for a valid LOA number to proceed with the gate pass application.
                    The application form will appear after you select a valid LOA.
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}