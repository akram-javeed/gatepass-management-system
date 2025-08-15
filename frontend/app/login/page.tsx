"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Building2, Users, Shield, UserCheck, Crown } from "lucide-react"

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Staff Login Portal</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Select your role to access the respective dashboard</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Contract Section
              </CardTitle>
              <CardDescription>Manage contracts and LOA entries</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/contract-section/login">
                <Button className="w-full">Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                SSE Login
              </CardTitle>
              <CardDescription>Supervisor review and approval</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/sse-dashboard/login">
                <Button className="w-full">Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety Officer
              </CardTitle>
              <CardDescription>Safety review and modifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/safety-officer/login">
                <Button className="w-full">Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Officer Login
              </CardTitle>
              <CardDescription>Officer 1 & 2 approvals with DSC</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/officer-dashboard/login">
                <Button className="w-full">Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Ch.OS/NPB
              </CardTitle>
              <CardDescription>Final approval and PDF generation</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chos-dashboard/login">
                <Button className="w-full">Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            For contractor gate pass applications (no login required),
            <Link href="/gate-pass-application" className="text-blue-600 hover:underline ml-1">
              click here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
