"use client"

import type React from "react"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Home, FileText, Clock, ArrowRight, Mail, Users, Shield, Award, Send } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

interface ApprovalStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'current' | 'completed'
  estimatedTime: string
}

// Loading component for Suspense fallback
function ConfirmationLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading confirmation details...</p>
      </div>
    </div>
  )
}

// Component that uses useSearchParams (wrapped in Suspense)
function ConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [applicationData, setApplicationData] = useState<{
    id?: string
    loa_number?: string
    status?: string
    submitted_date?: string
  } | null>(null)

  useEffect(() => {
    // Try to get application data from URL params
    const appId = searchParams?.get('id')
    const loaNumber = searchParams?.get('loa')
    const status = searchParams?.get('status') || 'pending_with_sse'
    const submittedDate = searchParams?.get('date')

    if (appId || loaNumber) {
      setApplicationData({
        id: appId || undefined,
        loa_number: loaNumber || undefined,
        status: status,
        submitted_date: submittedDate || new Date().toISOString()
      })
    }
  }, [searchParams])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_with_sse':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />
            Pending SSE Review
          </Badge>
        )
      case 'pending_with_safety':
        return (
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
            <Shield className="h-3 w-3 mr-1" />
            With Safety Officer
          </Badge>
        )
      case 'pending_with_officer1':
      case 'pending_with_officer2':
        return (
          <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
            <Users className="h-3 w-3 mr-1" />
            With Technical Officer
          </Badge>
        )
      case 'pending_with_chos':
        return (
          <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1">
            <Award className="h-3 w-3 mr-1" />
            Final Processing
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved & Sent
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        )
    }
  }

  const getApprovalSteps = (currentStatus: string): ApprovalStep[] => {
    const getCurrentStepStatus = (stepStatus: string) => {
      const statusOrder = [
        'pending_with_sse',
        'pending_with_safety', 
        'pending_with_officer1',
        'pending_with_officer2',
        'pending_with_chos',
        'approved'
      ]
      
      const currentIndex = statusOrder.indexOf(currentStatus)
      const stepIndex = statusOrder.indexOf(stepStatus)
      
      if (stepIndex < currentIndex) return 'completed'
      if (stepIndex === currentIndex) return 'current'
      return 'pending'
    }

    return [
      {
        id: 'sse',
        title: 'SSE Review',
        description: 'Senior Section Engineer reviews application details and contract compliance',
        icon: <Users className="h-5 w-5" />,
        status: getCurrentStepStatus('pending_with_sse'),
        estimatedTime: '1-2 business days'
      },
      {
        id: 'safety',
        title: 'Safety Officer',
        description: 'Safety department reviews safety compliance and insurance requirements',
        icon: <Shield className="h-5 w-5" />,
        status: getCurrentStepStatus('pending_with_safety'),
        estimatedTime: '1 business day'
      },
      {
        id: 'officer',
        title: 'Technical Officer',
        description: 'Technical officers review and approve with digital signature',
        icon: <Award className="h-5 w-5" />,
        status: getCurrentStepStatus('pending_with_officer1'),
        estimatedTime: '1-2 business days'
      },
      {
        id: 'chos',
        title: 'Ch.OS/NPB',
        description: 'Final approval, PDF generation, and distribution to contractor',
        icon: <Send className="h-5 w-5" />,
        status: getCurrentStepStatus('pending_with_chos'),
        estimatedTime: '1 business day'
      }
    ]
  }

  const approvalSteps = applicationData ? getApprovalSteps(applicationData.status || 'pending_with_sse') : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Application Submitted Successfully!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your gate pass application has been received and entered into our approval workflow system.
            </p>
          </div>

          {/* Application Details Card */}
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-6 w-6" />
                Application Details
              </CardTitle>
              <CardDescription className="text-green-50 text-base">
                Please save these details for your records and future reference
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {applicationData?.id && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700 text-lg">Application ID:</span>
                    <span className="font-mono bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-lg font-semibold">
                      #{applicationData.id}
                    </span>
                  </div>
                )}
                
                {applicationData?.loa_number && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700 text-lg">LOA Number:</span>
                    <span className="font-mono bg-gray-100 px-4 py-2 rounded-lg text-lg">
                      {applicationData.loa_number}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700 text-lg">Current Status:</span>
                  <div>
                    {getStatusBadge(applicationData?.status || 'pending_with_sse')}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-gray-700 text-lg">Submitted On:</span>
                  <span className="text-gray-600 text-lg">
                    {applicationData?.submitted_date 
                      ? formatDate(applicationData.submitted_date)
                      : formatDate(new Date().toISOString())
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Workflow */}
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-blue-700">
                <ArrowRight className="h-6 w-6" />
                Approval Workflow Process
              </CardTitle>
              <CardDescription className="text-base">
                Your application will go through the following approval stages
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {approvalSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.status === 'completed' 
                        ? 'bg-green-100 text-green-600' 
                        : step.status === 'current'
                        ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-200'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`font-semibold text-lg ${
                          step.status === 'current' ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h4>
                        <Badge variant={
                          step.status === 'completed' ? 'default' :
                          step.status === 'current' ? 'secondary' : 'outline'
                        }>
                          {step.status === 'completed' ? 'Completed' :
                           step.status === 'current' ? 'In Progress' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{step.description}</p>
                      <p className="text-sm text-gray-500">
                        Estimated time: {step.estimatedTime}
                      </p>
                    </div>
                    {index < approvalSteps.length - 1 && (
                      <div className={`w-px h-16 ml-6 ${
                        step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Notification Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-green-700">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Confirmation Email Sent</h4>
                    <p className="text-sm text-green-700">
                      A confirmation email with your application details has been sent to your registered email address.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Status Update Notifications</h4>
                    <p className="text-sm text-blue-700">
                      You will receive email notifications at each approval stage and when your gate pass is ready.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="mb-8 bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-800 text-xl">Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-amber-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Keep your Application ID safe</strong> - You'll need it for tracking and future reference.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Check your email regularly</strong> - All status updates will be sent to your registered email.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Processing time</strong> - Total approval process typically takes 3-5 business days.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Gate pass requirements</strong> - Bring company ID card and Aadhar card for entry.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Contact us</strong> - For urgent queries, contact the Gate Pass Administration Office.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto" size="lg">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <Link href="/gate-pass-application">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                Submit Another Application
              </Button>
            </Link>
          </div>

          {/* Contact Information */}
          <Card className="bg-gray-100 border-gray-200">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help or Have Questions?</h3>
              <p className="text-gray-600 mb-4">
                Contact the Gate Pass Administration Office for any queries or assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-600">
                <div>
                  <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM
                </div>
                <div>
                  <strong>Location:</strong> Carriage and Wagon Works, Perambur
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense wrapper
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationLoading />}>
      <ConfirmationContent />
    </Suspense>
  )
}