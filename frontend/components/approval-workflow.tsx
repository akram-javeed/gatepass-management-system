"use client"

import { CheckCircle, Clock, ArrowRight, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ApprovalStep {
  id: string
  name: string
  designation: string
  status: "pending" | "approved" | "rejected"
  timestamp?: string
  remarks?: string
}

interface ApprovalWorkflowProps {
  steps?: ApprovalStep[]
  currentStep?: number
}

export function ApprovalWorkflow({ steps = [], currentStep = 0 }: ApprovalWorkflowProps) {
  // Default workflow steps if none provided
  const defaultSteps: ApprovalStep[] = [
    {
      id: "sse",
      name: "SSE User",
      designation: "Senior Section Engineer",
      status: "approved",
      timestamp: "2024-01-15 10:30 AM",
    },
    {
      id: "safety",
      name: "Safety Officer",
      designation: "Safety Officer",
      status: "approved",
      timestamp: "2024-01-15 02:45 PM",
    },
    {
      id: "officer1",
      name: "Officer 1",
      designation: "Assistant Engineer",
      status: "pending",
      timestamp: undefined,
    },
    {
      id: "officer2",
      name: "Officer 2",
      designation: "Factory Manager",
      status: "pending",
      timestamp: undefined,
    },
    {
      id: "chos",
      name: "Ch.OS/NPB",
      designation: "Chief Operating Superintendent",
      status: "pending",
      timestamp: undefined,
    },
  ]

  const workflowSteps = steps.length > 0 ? steps : defaultSteps

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejected":
        return <CheckCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Approval Workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowSteps.map((step, index) => (
            <div key={step.id}>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <p className="font-medium">{step.name}</p>
                    <p className="text-sm text-gray-600">{step.designation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {step.timestamp && <p className="text-sm text-gray-500">{step.timestamp}</p>}
                  {getStatusBadge(step.status)}
                </div>
              </div>
              {index < workflowSteps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
