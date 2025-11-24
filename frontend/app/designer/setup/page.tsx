"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Gem, Store, MapPin, FileText, ArrowRight } from "lucide-react"

export default function DesignerSetupPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call to save designer details
    setTimeout(() => {
      setIsLoading(false)
      router.push("/designer/dashboard")
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Gem className="h-12 w-12 text-primary mr-2" />
            <h1 className="text-4xl font-serif font-bold text-foreground">Welcome, Designer!</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Let's set up your designer profile to showcase your beautiful creations
          </p>
        </div>

        <Card className="glass-card shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">Designer Profile Setup</CardTitle>
            <CardDescription>Complete your profile to start showcasing your jewelry collection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designer-name" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Designer Name
                  </Label>
                  <Input
                    id="designer-name"
                    name="designerName"
                    type="text"
                    placeholder="Your professional name"
                    className="rounded-xl"
                    defaultValue={user?.name}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your email address"
                    className="rounded-xl"
                    defaultValue={user?.email}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-name" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Business Name
                </Label>
                <Input
                  id="business-name"
                  name="businessName"
                  type="text"
                  placeholder="Your jewelry business name"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="City, State/Country"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Business Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell us about your jewelry design philosophy, specialties, and what makes your pieces unique..."
                  className="rounded-xl min-h-[120px] resize-none"
                  required
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl hover-glow"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Setting up profile...
                    </div>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>You can update these details anytime from your dashboard</p>
        </div>
      </div>
    </div>
  )
}
