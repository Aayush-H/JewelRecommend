"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, Plus, Minus, AlertCircle } from "lucide-react"
import { productsAPI } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (product: any) => void
  onSuccess?: () => void
}

export function AddProductModal({ isOpen, onClose, onAdd, onSuccess }: AddProductModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [materials, setMaterials] = useState<string[]>([""])
  const [colors, setColors] = useState<string[]>([""])
  const [occasions, setOccasions] = useState<string[]>([""])
  const [styles, setStyles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState("")
  const [gender, setGender] = useState<"men" | "women" | "unisex">("unisex")
  const [link, setLink] = useState("")

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedImage(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""])
  }

  const removeField = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  const updateField = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  const toggleStyle = (styleValue: string) => {
    setStyles((prev) => (prev.includes(styleValue) ? prev.filter((s) => s !== styleValue) : [...prev, styleValue]))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)

      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      formData.set("materials", materials.filter((m) => m.trim() !== "").join(","))
      formData.set("colors", colors.filter((c) => c.trim() !== "").join(","))
      formData.set("occasions", occasions.filter((o) => o.trim() !== "").join(","))
      formData.set("style", styles.join(","))
      formData.set("gender", gender)
      formData.set("link", link)

      const response = await productsAPI.create(formData)

      if (onSuccess) {
        await onSuccess()
      }

      setSelectedImage(null)
      setMaterials([""])
      setColors([""])
      setOccasions([""])
      setStyles([])
      setCategory("")
      setGender("unisex")
      setLink("")

      onClose()
    } catch (error) {
      console.error("Failed to create product:", error)
      setError(error instanceof Error ? error.message : "Failed to create product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-serif">Add New Product</CardTitle>
            <CardDescription>Add a new jewelry piece to your collection</CardDescription>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Elegant Diamond Necklace"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" value={category} onValueChange={setCategory} required>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="necklace">Necklace</SelectItem>
                        <SelectItem value="earrings">Earrings</SelectItem>
                        <SelectItem value="bracelet">Bracelet</SelectItem>
                        <SelectItem value="ring">Ring</SelectItem>
                        <SelectItem value="anklet">Anklet</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input id="subcategory" name="subcategory" placeholder="e.g., Engagement" className="rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (INR) *</Label>
                  <Input id="price" name="price" type="number" placeholder="10000" className="rounded-xl" required />
                </div>

                <div className="space-y-2">
                  <Label>Styles (Select at least one) *</Label>
                  <div className="flex flex-wrap gap-2">
                    {["traditional", "modern", "fusion", "minimalist"].map((styleOption) => (
                      <Button
                        key={styleOption}
                        type="button"
                        variant={styles.includes(styleOption) ? "default" : "outline"}
                        className="rounded-lg capitalize"
                        onClick={() => toggleStyle(styleOption)}
                        aria-pressed={styles.includes(styleOption)}
                      >
                        {styleOption}
                      </Button>
                    ))}
                  </div>
                  {styles.length === 0 && <p className="text-xs text-red-500">At least one style is required</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Product Link *</Label>
                  <Input
                    id="link"
                    name="link"
                    type="url"
                    placeholder="https://yourwebsite.com/product"
                    className="rounded-xl"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">The URL where customers can view/buy this product</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your jewelry piece, its craftsmanship, and unique features..."
                    className="rounded-xl min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">For Whom? *</Label>
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
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Image *</Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedImage ? (
                      <div className="space-y-4">
                        <div className="w-full h-48 mx-auto bg-muted rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(selectedImage) || "/placeholder.svg"}
                            alt="Selected"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedImage.name}</p>
                        <Button
                          type="button"
                          onClick={() => setSelectedImage(null)}
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium">Drop your image here</p>
                          <p className="text-sm text-muted-foreground">or click to browse</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="product-image-upload"
                          required
                        />
                        <Button
                          type="button"
                          onClick={() => document.getElementById("product-image-upload")?.click()}
                          variant="outline"
                          className="rounded-lg"
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label>Materials *</Label>
                {materials.map((material, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={material}
                      onChange={(e) => updateField(index, e.target.value, setMaterials)}
                      placeholder="e.g., gold"
                      className="rounded-xl"
                      required
                    />
                    {materials.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeField(index, setMaterials)}
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addField(setMaterials)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>

              <div className="space-y-3">
                <Label>Colors *</Label>
                {colors.map((color, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={color}
                      onChange={(e) => updateField(index, e.target.value, setColors)}
                      placeholder="e.g., gold"
                      className="rounded-xl"
                      required
                    />
                    {colors.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeField(index, setColors)}
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addField(setColors)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Color
                </Button>
              </div>

              <div className="space-y-3">
                <Label>Occasions *</Label>
                {occasions.map((occasion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={occasion}
                      onChange={(e) => updateField(index, e.target.value, setOccasions)}
                      placeholder="e.g., wedding"
                      className="rounded-xl"
                      required
                    />
                    {occasions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeField(index, setOccasions)}
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addField(setOccasions)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Occasion
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1 rounded-xl bg-transparent">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl hover-glow"
                disabled={isLoading || styles.length === 0}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adding Product...
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
