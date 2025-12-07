"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Gem,
  Upload,
  Sparkles,
  LogOut,
  AlertCircle,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { recommendationsAPI, API_URL } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { analyticsAPI } from "@/lib/api"

interface JewelryItem {
  _id: string
  name: string
  price: number
  category: string
  subcategory: string
  images: Array<{ filename: string; url: string }>
  description: string
  materials: string[]
  colors: string[]
  style: string
  occasions: string[]
  designer: {
    _id: string
    name: string
    businessName: string
    location: { city: string; state: string }
  }
  score?: number
  imageUrl?: string
  link?: string // New field for product link
}

function resolveProductImageSrc(item: any, apiBase: string) {
  const url: string | undefined =
    item?.images?.[0]?.url ?? (item as any)?.imageUrl
  if (!url) return "/jewelry-placeholder.jpg"
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${apiBase}${url}`
}

export default function RecommendationsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [occasion, setOccasion] = useState("daily")
  const [style, setStyle] = useState("modern")
  const [budget, setBudget] = useState("50000")
  const [material, setMaterial] = useState("")
  const [category, setCategory] = useState("")
  const [recommendations, setRecommendations] = useState<JewelryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gender, setGender] = useState<"men" | "women" | "unisex">("unisex")
  const [hasSearched, setHasSearched] = useState(false)
  const [isTipsOpen, setIsTipsOpen] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      setSelectedImage(e.dataTransfer.files[0])
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0])
      setSelectedImage(e.target.files[0])
  }

  const handleGetRecommendations = async () => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      let response
      const numericBudget = isNaN(Number(budget)) ? undefined : Number(budget)
      if (selectedImage) {
        const formData = new FormData()
        formData.append("image", selectedImage)
        if (occasion) formData.append("occasion", occasion)
        if (style) formData.append("style", style)
        if (numericBudget !== undefined) formData.append("budget", String(numericBudget))
        if (material && material !== "any") formData.append("material", material)
        if (category && category !== "any") formData.append("category", category)
        if (gender) formData.append("gender", gender)

        response = await recommendationsAPI.analyzeImage(formData)
        setRecommendations(response.recommendations)
      } else {
        response = await recommendationsAPI.getSuggestions({
          occasion,
          style,
          budget: numericBudget,
          materials: material && material !== "any" ? material : undefined,
          category: category && category !== "any" ? category : undefined,
          gender,
        })
        setRecommendations(response.recommendations)
      }
    } catch (error) {
      console.error("Recommendation error:", error)
      setError(error instanceof Error ? error.message : "Failed to get recommendations. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleTipsOpenChange = async (open: boolean) => {
    setIsTipsOpen(open)
    try {
      await analyticsAPI.logEvent(open ? "example_poses_opened" : "example_poses_closed")
    } catch (e) {
      console.error("analytics log failed:", e)
    }
  }

  const DESIGNER_WEBSITE =
    (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_DESIGNER_WEBSITE) || "https://jewelrydesigns.com/design-your-own/"

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div className="flex items-center gap-3">
            <Gem className="h-8 w-8 text-primary animate-float" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Welcome, {user?.name}
              </h1>
              <p className="text-muted-foreground">
                Find your perfect jewelry match
              </p>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2 rounded-xl hover-lift bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Section */}
          <Card className="glass-card animate-slide-in-left hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <Upload className="h-5 w-5" />
                Upload Your Style
              </CardTitle>
              <p className="text-sm text-foreground/80">
                For the best AI recommendations, please upload a clear, well-lit photo showing your outfit and skin tone.
              </p>

              {/* Example Poses Dialog */}
              <Dialog open={isTipsOpen} onOpenChange={handleTipsOpenChange}>
                <DialogTrigger asChild>
                  <Button
                    className="mt-3 w-fit rounded-xl py-3 px-6 font-semibold text-black hover-glow btn-primary transition-all
                               bg-[#FFD700] hover:bg-[#DAA520] shadow-[0_0_18px_rgba(218,165,32,0.25)]"
                  >
                    Try Example Poses
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl border border-yellow-500/40 shadow-xl max-w-3xl w-[95%] p-0 overflow-hidden">
                  <div
                    className="backdrop-blur-xl"
                    style={{ backgroundImage: "linear-gradient(to right, #afaaff, #f7ccff)" }}
                  >
                    <div className="p-6">
                      <DialogHeader className="relative">
                        <DialogClose asChild>
                          <button
                            aria-label="Close"
                            className="absolute right-0 top-0 p-2 rounded-full hover:bg-black/5 transition"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </DialogClose>
                        <DialogTitle className="font-serif text-2xl font-bold" style={{ color: "#DAA520" }}>
                          Upload Tips for Better Recommendations
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-foreground/80">
                          Follow these simple examples to help our AI understand your style better.
                        </DialogDescription>
                      </DialogHeader>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="mt-5"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            {
                              src: "/poses/front-facing.jpg",
                              text: "Front-facing with clear lighting",
                            },
                            {
                              src: "/poses/half-body.jpg",
                              text: "Half-body showing jewelry and outfit",
                            },
                            {
                              src: "/poses/natural-light.jpg",
                              text: "Use natural light for accurate tones",
                            },
                            {
                              src: "/poses/no-shadow.jpg",
                              text: "Avoid harsh shadows or dark filters",
                            },
                          ].map((pose, i) => (
                            <div className="group" key={i}>
                              <div className="overflow-hidden rounded-xl shadow-md">
                                <img
                                  src={pose.src}
                                  alt={pose.text}
                                  className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              </div>
                              <p className="mt-2 text-sm text-gray-800">{pose.text}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 flex justify-center">
                          <DialogClose asChild>
                            <Button
                              className="rounded-xl font-semibold text-black hover-glow
                                         transition-transform bg-[linear-gradient(to_right,#FFD700,#DAA520)]
                                         hover:scale-[1.02]"
                            >
                              Got it!
                            </Button>
                          </DialogClose>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <CardDescription>
                Upload an image of jewelry you like or your outfit for personalized recommendations
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-105"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedImage ? (
                  <div className="space-y-4 animate-scale-in">
                    <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(selectedImage) || "/placeholder.svg"}
                        alt="Selected"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedImage.name}</p>
                    <Button onClick={() => setSelectedImage(null)} variant="outline" size="sm" className="rounded-lg hover-scale">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground animate-float" />
                    <div>
                      <p className="text-lg font-medium">Drop your image here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                    <Button onClick={() => document.getElementById("file-upload")?.click()} variant="outline" className="rounded-lg hover-scale">
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-in-right hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <Sparkles className="h-5 w-5" />
                Your Preferences
              </CardTitle>
              <CardDescription>Tell us about the occasion and your style preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Jewelry Type</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="necklace">Necklace</SelectItem>
                    <SelectItem value="earrings">Earrings</SelectItem>
                    <SelectItem value="bracelet">Bracelet</SelectItem>
                    <SelectItem value="ring">Ring</SelectItem>
                    <SelectItem value="anklet">Anklet</SelectItem>
                    <SelectItem value="set">Complete Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">For whom?</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={gender === "unisex" ? "default" : "outline"}
                    className="rounded-xl"
                    onClick={() => setGender("unisex")}
                    aria-pressed={gender === "unisex"}
                  >
                    Unisex
                  </Button>
                  <Button
                    type="button"
                    variant={gender === "women" ? "default" : "outline"}
                    className="rounded-xl"
                    onClick={() => setGender("women")}
                    aria-pressed={gender === "women"}
                  >
                    Women
                  </Button>
                  <Button
                    type="button"
                    variant={gender === "men" ? "default" : "outline"}
                    className="rounded-xl"
                    onClick={() => setGender("men")}
                    aria-pressed={gender === "men"}
                  >
                    Men
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Wear</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="party">Party</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style Preference</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traditional">Traditional</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="fusion">Fusion</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Max Budget (₹)</Label>
                <Input
                  id="budget"
                  type="number"
                  min={0}
                  step={500}
                  inputMode="numeric"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="50000"
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Set your maximum price. We’ll cap results at this value.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material Preference</Label>
                <Select value={material} onValueChange={setMaterial}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Any material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Material</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="pearl">Pearl</SelectItem>
                    <SelectItem value="gemstone">Gemstone</SelectItem>
                    <SelectItem value="artificial">Artificial</SelectItem>
                    <SelectItem value="kundan">Kundan</SelectItem>
                    <SelectItem value="meenakari">Meenakari</SelectItem>
                    <SelectItem value="polki">Polki</SelectItem>
                    <SelectItem value="jadau">Jadau</SelectItem>
                    <SelectItem value="brass">Brass</SelectItem>
                    <SelectItem value="copper">Copper</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                    <SelectItem value="emerald">Emerald</SelectItem>
                    <SelectItem value="sapphire">Sapphire</SelectItem>
                    <SelectItem value="white-gold">White Gold</SelectItem>
                    <SelectItem value="rose-gold">Rose Gold</SelectItem>
                    <SelectItem value="antique-gold">Antique Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                
                <div className="space-y-2">
                                <Label htmlFor="category">Jewelry Type (Optional)</Label>
                                <Select value={category} onValueChange={setCategory}>
                                  <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Any type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="any">Any Type</SelectItem>
                                    <SelectItem value="necklace">Necklace</SelectItem>
                                    <SelectItem value="earrings">Earrings</SelectItem>
                                    <SelectItem value="bracelet">Bracelet</SelectItem>
                                    <SelectItem value="ring">Ring</SelectItem>
                                    <SelectItem value="anklet">Anklet</SelectItem>
                                    <SelectItem value="set">Complete Set</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

              <Button
                onClick={handleGetRecommendations}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold rounded-xl hover-glow btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Finding matches...
                  </div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {hasSearched && !isLoading && recommendations.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
            No recommendations found. Try adjusting your filters.
          </p>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground animate-slide-up gradient-text">
              Perfect Matches for You
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((item, index) => (
                <a
                  key={item._id}
                  href={item.link || DESIGNER_WEBSITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="glass-card hover-lift overflow-hidden group">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={resolveProductImageSrc(item, API_URL) || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-foreground mb-2">{item.name}</h3>
                        <p className="text-2xl font-bold gradient-text">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.materials.slice(0, 3).map((material, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm font-medium text-foreground">{item.designer.businessName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.designer.location.city}, {item.designer.location.state}
                        </p>
                      </div>
                      {item.score && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{item.score}% match</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
