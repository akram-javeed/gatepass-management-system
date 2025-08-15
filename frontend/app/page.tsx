"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Train, FileText, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        })
      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("user_session", JSON.stringify(data))

        toast({
          title: "Login Successful",
          description: `Welcome, ${data.name}`,
        })

        router.push(data.redirect || "/")
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGatePassClick = () => {
    router.push("/gate-pass-application")
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8)), url('/placeholder.svg?height=800&width=600')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 h-full flex flex-col justify-center p-8 lg:p-12">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Train className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">CWPER Gatepermit</h1>
              <p className="text-blue-100 text-lg">Quick Gate Permit Application</p>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Apply for Gate Permit
                </CardTitle>
                <CardDescription className="text-blue-100">No login required - Public access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Tabs defaultValue="apply" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/20">
                      <TabsTrigger value="apply" className="text-white data-[state=active]:bg-white/30">
                        Apply
                      </TabsTrigger>
                      <TabsTrigger value="track" className="text-white data-[state=active]:bg-white/30">
                        Track Status
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="apply" className="space-y-4">
                      <div className="text-center text-white text-sm">
                        Click below to start your gate permit application process
                      </div>
                      <Button
                        onClick={handleGatePassClick}
                        className="w-full bg-white text-purple-600 hover:bg-gray-100"
                        size="lg"
                      >
                        Apply for Gate Permit
                      </Button>
                    </TabsContent>

                    <TabsContent value="track" className="space-y-4">
                      <div className="text-center text-white text-sm mb-4">
                        Enter your application number to track status
                      </div>
                      <div className="space-y-3">
                        <Input
                          placeholder="Enter Application Number (e.g., GP2024001)"
                          className="bg-white/20 border-white/30 text-white placeholder-white/70"
                        />
                        <Button className="w-full bg-white text-purple-600 hover:bg-gray-100" size="lg">
                          Track Application
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                  {/* New Temporary Gate Pass */}
                  <Button
                    onClick={() => router.push("/temporary-gate-pass")}
                    className="w-full bg-orange-500 text-white hover:bg-orange-600"
                    size="lg"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Temporary Gate Permit (Max 3 Days)
                  </Button>
                  
                  <div className="text-xs text-blue-100 text-center mt-2">
                    * Temporary permits are for urgent work up to 3 days only
                  </div>
                  </div>
                </CardContent>
              </Card>

            <div className="flex justify-center mt-8 space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-gray-800 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Staff Login</h2>
            <p className="text-gray-400">Access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                placeholder="Enter your username"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}