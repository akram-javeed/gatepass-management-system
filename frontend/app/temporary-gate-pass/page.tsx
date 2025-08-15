// app/temporary-gate-pass/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowLeft, Clock, AlertCircle, CheckCircle, RefreshCw, Users } from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// Add interface for Officer
interface Officer {
  id: string
  full_name: string
  employee_id: string
  role: string
  email: string
}

export default function TemporaryGatePassPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loadingOfficers, setLoadingOfficers] = useState(false)
  
  const [formData, setFormData] = useState({
    firmName: "",
    address: "",
    representativeName: "",
    phoneNumber: "",
    email: "",
    aadharNumber: "",
    numberOfPersons: "",
    natureOfWork: "",
    periodFrom: undefined as Date | undefined,
    periodTo: undefined as Date | undefined,
    forwardTo: "",
    forwardToRole: "", // Add this to track the role
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch officers when component mounts
  useEffect(() => {
    fetchOfficers()
  }, [])

  const fetchOfficers = async () => {
    try {
      setLoadingOfficers(true)
      console.log("Fetching officers for dropdown...")
      
      // Fetch users with role officer1 or officer2
      const response = await fetch('/api/users?roles=officer1,officer2')
      const data = await response.json()
      
      if (data.success && data.users) {
        setOfficers(data.users)
        console.log(`Loaded ${data.users.length} officers:`, data.users)
      } else {
        console.error("Failed to fetch officers:", data.error)
        toast({
          title: "Warning",
          description: "Could not load officers list. You can still enter manually.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching officers:", error)
      toast({
        title: "Error",
        description: "Failed to load officers list",
        variant: "destructive",
      })
    } finally {
      setLoadingOfficers(false)
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firmName) newErrors.firmName = "Firm name is required"
    if (!formData.address) newErrors.address = "Address is required"
    if (!formData.representativeName) newErrors.representativeName = "Representative name is required"
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required"
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits"
    }
    if (!formData.email) newErrors.email = "Email is required"
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }
    if (!formData.aadharNumber) newErrors.aadharNumber = "Aadhar number is required"
    if (formData.aadharNumber && !/^\d{12}$/.test(formData.aadharNumber.replace(/\s/g, ""))) {
      newErrors.aadharNumber = "Aadhar must be 12 digits"
    }
    if (!formData.numberOfPersons) newErrors.numberOfPersons = "Number of persons is required"
    if (formData.numberOfPersons && parseInt(formData.numberOfPersons) < 1) {
      newErrors.numberOfPersons = "Must be at least 1 person"
    }
    if (!formData.natureOfWork) newErrors.natureOfWork = "Nature of work is required"
    if (!formData.periodFrom) newErrors.periodFrom = "Start date is required"
    if (!formData.periodTo) newErrors.periodTo = "End date is required"
    if (!formData.forwardTo) newErrors.forwardTo = "Please select an officer to forward to"
    
    // Check date range (max 3 days)
    if (formData.periodFrom && formData.periodTo) {
      const daysDiff = differenceInDays(formData.periodTo, formData.periodFrom)
      if (daysDiff < 0) {
        newErrors.periodTo = "End date must be after start date"
      } else if (daysDiff > 2) {
        newErrors.periodTo = "Maximum period is 3 days"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get selected officer details
      const selectedOfficer = officers.find(o => o.id === formData.forwardTo)
      
      const submitData = {
        firm_name: formData.firmName,
        address: formData.address,
        representative_name: formData.representativeName,
        phone_number: formData.phoneNumber,
        email: formData.email,
        aadhar_number: formData.aadharNumber,
        number_of_persons: parseInt(formData.numberOfPersons),
        nature_of_work: formData.natureOfWork,
        period_from: format(formData.periodFrom!, "yyyy-MM-dd"),
        period_to: format(formData.periodTo!, "yyyy-MM-dd"),
        forward_to_user_id: formData.forwardTo, // Send user ID
        forward_to_role: selectedOfficer?.role || formData.forwardToRole, // Send role
        forward_to_name: selectedOfficer?.full_name || '', // Send name for reference
        application_type: "temporary",
      }

      console.log("Submitting temporary gate pass:", submitData)

      const response = await fetch("/api/temporary-gate-pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "✅ Application Submitted Successfully!",
          description: `Your temporary gate pass application has been forwarded to ${
            selectedOfficer?.full_name || 'the selected officer'
          } (${selectedOfficer?.role === 'officer1' ? 'Officer 1' : 'Factory Manager'})`,
        })

        // Redirect to confirmation page
        setTimeout(() => {
          router.push(`/confirmation?id=${data.application?.id}&type=temporary&status=${data.application?.status}`)
        }, 2000)
      } else {
        throw new Error(data.error || "Failed to submit application")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "❌ Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format Aadhar with spaces
  const formatAadhar = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})$/)
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(" ")
    }
    return value
  }

  // Handle officer selection
const handleOfficerSelection = (officerId: string) => {
  console.log("Selected officer ID:", officerId)
  const selectedOfficer = officers.find(o => o.id.toString() === officerId.toString())
  console.log("Found officer:", selectedOfficer)
  
  setFormData({
    ...formData,
    forwardTo: officerId,
    forwardToRole: selectedOfficer?.role || ''
  })
}
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
          <div>
            <h1 className="text-3xl font-bold">Temporary Gate Pass Application</h1>
            <p className="text-gray-600">For urgent work (Maximum 3 days)</p>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-orange-700">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5" />
                <span>This form is only for temporary gate passes up to <strong>3 days maximum</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <span>Application will be forwarded directly to Officer for quick approval</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>For longer periods, please use the regular gate pass application</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Temporary Gate Pass Details</CardTitle>
            <CardDescription>
              Fill all required fields. This application will be processed on priority.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* [Previous form fields remain the same until the Forward To section] */}
              
              {/* Firm Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Firm Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firmName">Name of the Firm *</Label>
                    <Input
                      id="firmName"
                      value={formData.firmName}
                      onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                      placeholder="Enter firm name"
                      className={errors.firmName ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.firmName && <p className="text-xs text-red-500">{errors.firmName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="representativeName">Represented by (Name) *</Label>
                    <Input
                      id="representativeName"
                      value={formData.representativeName}
                      onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                      placeholder="Representative's full name"
                      className={errors.representativeName ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.representativeName && <p className="text-xs text-red-500">{errors.representativeName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Complete address of the firm"
                    rows={3}
                    className={errors.address ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={errors.phoneNumber ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email ID *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className={errors.email ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                    <Input
                      id="aadharNumber"
                      value={formatAadhar(formData.aadharNumber)}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value.replace(/\s/g, "") })}
                      placeholder="1234 5678 9012"
                      maxLength={14}
                      className={errors.aadharNumber ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.aadharNumber && <p className="text-xs text-red-500">{errors.aadharNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Work Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Work Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfPersons">Number of Persons *</Label>
                    <Input
                      id="numberOfPersons"
                      type="number"
                      value={formData.numberOfPersons}
                      onChange={(e) => setFormData({ ...formData, numberOfPersons: e.target.value })}
                      placeholder="Enter number"
                      min="1"
                      className={errors.numberOfPersons ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.numberOfPersons && <p className="text-xs text-red-500">{errors.numberOfPersons}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="natureOfWork">Nature of Work *</Label>
                    <Input
                      id="natureOfWork"
                      value={formData.natureOfWork}
                      onChange={(e) => setFormData({ ...formData, natureOfWork: e.target.value })}
                      placeholder="e.g., Electrical repair, Plumbing, Inspection"
                      className={errors.natureOfWork ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.natureOfWork && <p className="text-xs text-red-500">{errors.natureOfWork}</p>}
                  </div>
                </div>

                {/* Period Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Period From *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.periodFrom && "text-muted-foreground",
                            errors.periodFrom && "border-red-500"
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.periodFrom ? format(formData.periodFrom, "PPP") : "Select start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.periodFrom}
                          onSelect={(date) => {
                            setFormData({ ...formData, periodFrom: date })
                            // Auto-set max date if not selected
                            if (date && !formData.periodTo) {
                              setFormData(prev => ({ 
                                ...prev, 
                                periodFrom: date,
                                periodTo: addDays(date, 2) // Default to 3 days
                              }))
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.periodFrom && <p className="text-xs text-red-500">{errors.periodFrom}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Period To *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.periodTo && "text-muted-foreground",
                            errors.periodTo && "border-red-500"
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.periodTo ? format(formData.periodTo, "PPP") : "Select end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.periodTo}
                          onSelect={(date) => setFormData({ ...formData, periodTo: date })}
                          disabled={(date) => {
                            if (!formData.periodFrom) return true
                            const minDate = formData.periodFrom
                            const maxDate = addDays(formData.periodFrom, 2)
                            return date < minDate || date > maxDate
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.periodTo && <p className="text-xs text-red-500">{errors.periodTo}</p>}
                    {formData.periodFrom && formData.periodTo && (
                      <p className="text-xs text-gray-600">
                        Duration: {differenceInDays(formData.periodTo, formData.periodFrom) + 1} day(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>
{/* UPDATED Forward To Selection - Fixed to show name instead of ID */}
<div className="space-y-4">
  <h3 className="text-lg font-semibold border-b pb-2">Approval Routing</h3>
  
  <div className="space-y-2">
    <Label htmlFor="forwardTo" className="flex items-center gap-2">
      Forward To *
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={fetchOfficers}
        disabled={loadingOfficers}
        className="h-6 px-2"
      >
        <RefreshCw className={cn("h-3 w-3", loadingOfficers && "animate-spin")} />
      </Button>
    </Label>
    
    <Select
      value={formData.forwardTo}
      onValueChange={handleOfficerSelection}
      disabled={isSubmitting || loadingOfficers}
    >
      <SelectTrigger className={errors.forwardTo ? "border-red-500" : ""}>
        <SelectValue placeholder={loadingOfficers ? "Loading officers..." : "Select officer to forward application"}>
          {/* FIX: This will display the selected officer's name */}
          {(() => {
            if (formData.forwardTo && officers.length > 0) {
              const selectedOfficer = officers.find(o => o.id.toString() === formData.forwardTo.toString())
              if (selectedOfficer) {
                return `${selectedOfficer.full_name} (${selectedOfficer.role === 'officer1' ? 'Officer 1' : 'Officer 2'})`
              }
            }
            return null
          })()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {officers.length === 0 ? (
          <div className="p-2 text-sm text-gray-500">
            No officers found. Please contact admin.
          </div>
        ) : (
          <>
            {/* Group Officer 1 */}
            {officers.filter(o => o.role === 'officer1').length > 0 && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-600 bg-gray-100">
                  Officer 1 - Technical Review
                </div>
                {officers
                  .filter(o => o.role === 'officer1')
                  .map((officer) => (
                    <SelectItem key={officer.id} value={officer.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">{officer.full_name}</div>
                          <div className="text-xs text-gray-500">
                            {officer.employee_id} • {officer.email}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
              </>
            )}
            
            {/* Group Officer 2 */}
            {officers.filter(o => o.role === 'officer2').length > 0 && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-600 bg-gray-100 border-t">
                  Officer 2 - Factory Manager
                </div>
                {officers
                  .filter(o => o.role === 'officer2')
                  .map((officer) => (
                    <SelectItem key={officer.id} value={officer.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">{officer.full_name}</div>
                          <div className="text-xs text-gray-500">
                            {officer.employee_id} • {officer.email}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
              </>
            )}
          </>
        )}
      </SelectContent>
    </Select>
    
    {errors.forwardTo && <p className="text-xs text-red-500">{errors.forwardTo}</p>}
    
    {/* Show selected officer details */}
    {formData.forwardTo && officers.length > 0 && (() => {
      const selectedOfficer = officers.find(o => o.id.toString() === formData.forwardTo.toString())
      return selectedOfficer ? (
        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm">
            <p className="font-medium text-green-800">Selected Officer:</p>
            <p className="text-green-700">
              {selectedOfficer.full_name} ({selectedOfficer.role === 'officer1' ? 'Officer 1 - Technical' : 'Officer 2 - Factory Manager'})
            </p>
            <p className="text-green-600 text-xs mt-1">
              Employee ID: {selectedOfficer.employee_id} | Email: {selectedOfficer.email}
            </p>
          </div>
        </div>
      ) : null
    })()}
    
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
      <p className="text-sm text-blue-700">
        <strong>Note:</strong> After approval by the selected officer, the application will be 
        automatically forwarded to Ch.OS/NPB for final gate pass generation.
      </p>
    </div>
  </div>
</div>
              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  disabled={isSubmitting || officers.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    "Submit Temporary Gate Pass Application"
                  )}
                </Button>
                
                <Link href="/">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}