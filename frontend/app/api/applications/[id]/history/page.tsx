"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ApprovalHistory } from "@/components/ApprovalHistory"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"

export default function ApplicationHistoryPage() {
  const params = useParams()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applicationData, setApplicationData] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      fetchHistory(params.id as string)
    }
  }, [params.id])

  const fetchHistory = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/applications/${id}/history`)
      const data = await response.json()
      
      if (data.success) {
        setHistory(data.approvalHistory)
        setApplicationData({
          loaNumber: data.loaNumber,
          currentStatus: data.currentStatus,
          summary: data.summary
        })
      }
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading approval history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {applicationData && (
          <div className="mb-6 grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total Stages</p>
                <p className="text-2xl font-bold">{applicationData.summary?.totalStages || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {applicationData.summary?.completedStages || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {applicationData.summary?.pendingStages || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {applicationData.summary?.rejectedStages || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <ApprovalHistory 
          history={history} 
          loaNumber={applicationData?.loaNumber}
        />
      </div>
    </div>
  )
}