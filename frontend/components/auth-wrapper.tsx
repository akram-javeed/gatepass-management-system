"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AuthWrapperProps {
  children: React.ReactNode
  requiredRole: string
  redirectTo: string
}

interface Session {
  username: string
  name: string
  role: string
  loginTime: string
}

export function AuthWrapper({ children, requiredRole, redirectTo }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem("user_session")
        if (sessionData) {
          const parsedSession: Session = JSON.parse(sessionData)

          // Check if session is valid (not expired - 8 hours)
          const loginTime = new Date(parsedSession.loginTime)
          const now = new Date()
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

          if (hoursDiff < 8 && parsedSession.role === requiredRole) {
            setSession(parsedSession)
            setIsAuthenticated(true)
          } else {
            // Session expired or wrong role
            localStorage.removeItem("user_session")
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [requiredRole])

  const handleLogout = () => {
    localStorage.removeItem("user_session")
    router.push(redirectTo)
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>You need to be logged in to access this page</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Link href="/">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user info and logout - only for non-admin pages */}
      {requiredRole !== "admin" && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <div>
                  <p className="text-sm font-medium">Welcome, {session?.name}</p>
                  <p className="text-xs text-gray-500">Role: {session?.role}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
