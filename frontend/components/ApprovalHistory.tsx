import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  UserCheck, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowDown,
  User
} from "lucide-react"

interface ApprovalStep {
  stage: string
  title: string
  status: 'completed' | 'approved' | 'rejected' | 'pending'
  date?: string
  formattedDate?: string
  user?: string
  userId?: number
  employeeId?: string
  userRole?: string
  action?: string
  remarks?: string
  forwardedTo?: string
  icon: string
}

interface ApprovalHistoryProps {
  history: ApprovalStep[]
  loaNumber?: string
}

export function ApprovalHistory({ history, loaNumber }: ApprovalHistoryProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="h-5 w-5" />
      case 'UserCheck': return <UserCheck className="h-5 w-5" />
      case 'Shield': return <Shield className="h-5 w-5" />
      case 'CheckCircle': return <CheckCircle className="h-5 w-5" />
      case 'XCircle': return <XCircle className="h-5 w-5" />
      case 'Clock': return <Clock className="h-5 w-5" />
      default: return <User className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Approval Flow History</span>
          {loaNumber && (
            <Badge variant="outline" className="font-mono">
              {loaNumber}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((step, index) => (
            <div key={step.stage}>
              <div className={`flex gap-4 ${index < history.length - 1 ? 'pb-4' : ''}`}>
                {/* Icon Column */}
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${getStatusColor(step.status)}`}>
                    {getIcon(step.icon)}
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-300 mt-2" />
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      {step.user && (
                        <p className="text-sm text-gray-600">
                          {step.user}
                          {step.employeeId && ` (${step.employeeId})`}
                          {step.userRole && ` - ${step.userRole}`}
                        </p>
                      )}
                      {step.formattedDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {step.formattedDate}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(step.status)} ml-2`}
                    >
                      {step.status === 'completed' ? 'Completed' :
                       step.status === 'approved' ? 'Approved' :
                       step.status === 'rejected' ? 'Rejected' :
                       'Pending'}
                    </Badge>
                  </div>

                  {/* Remarks */}
                  {step.remarks && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">Remarks: </span>
                      {step.remarks}
                    </div>
                  )}

                  {/* Forwarded To */}
                  {step.forwardedTo && (
                    <div className="mt-2 text-sm text-blue-600">
                      <span className="font-medium">Forwarded to: </span>
                      {step.forwardedTo === 'officer1' ? 'Officer 1' : 'Factory Manager (Officer 2)'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}