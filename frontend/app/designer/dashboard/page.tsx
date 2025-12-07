"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gem, Plus, Package, TrendingUp, Users, LogOut, Edit, Trash2, Eye, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { AddProductModal } from "@/components/add-product-modal"
import { productsAPI } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
  _id: string
  name: string
  price: number
  category: string
  subcategory: string
  images: Array<{ filename: string; url: string }>
  materials: string[]
  colors: string[]
  occasions: string[]
  style: string
  inStock: boolean
}

export default function DesignerDashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

  const getProductImageSrc = (p: Product) => {
    // prefer first image url if present; fallback to potential legacy single imageUrl field
    const url =
      (p.images && p.images.length > 0 && p.images[0]?.url) ||
      (p as any).imageUrl ||
      ""

    if (!url) {
      return "/modern-tech-product.png"
    }

    // If already absolute (Cloudinary etc), use as-is; otherwise prefix with API base
    return /^https?:\/\//i.test(url) ? url : `${API_BASE}${url}`
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await productsAPI.getAll({ designer: user?.id })
      setProducts(response.products || [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setError(error instanceof Error ? error.message : "Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct])
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productsAPI.delete(productId)
      setProducts((prev) => prev.filter((p) => p._id !== productId))
    } catch (error) {
      console.error("Failed to delete product:", error)
      setError(error instanceof Error ? error.message : "Failed to delete product")
    }
  }

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.inStock).length,
    totalViews: 1247,
    totalSales: 23,
  }

  return (
    <>
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-slide-up">
            <div className="flex items-center gap-3">
              <Gem className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Designer Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold rounded-xl hover-glow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center gap-2 rounded-xl bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card animate-slide-up-delay-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card animate-slide-up-delay-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeProducts}</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card animate-slide-up-delay-3">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalViews}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card animate-slide-up-delay-3">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalSales}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Section */}
          <Card className="glass-card animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-serif">Your Products</CardTitle>
                  <CardDescription>Manage your jewelry collection and track performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first jewelry piece to showcase your work
                  </p>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <Card
                      key={product._id}
                      className={`border hover:shadow-lg transition-all duration-300 animate-slide-up-delay-${index + 1}`}
                    >
                      <CardHeader className="p-0">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={getProductImageSrc(product) || "/modern-tech-product.png"}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge variant={product.inStock ? "default" : "secondary"} className="capitalize">
                              {product.inStock ? "active" : "inactive"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {product.category} • {product.subcategory}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {product.materials.slice(0, 2).map((material) => (
                              <Badge key={material} variant="outline" className="text-xs capitalize">
                                {material}
                              </Badge>
                            ))}
                            {product.materials.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.materials.length - 2} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="rounded-lg bg-transparent">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg text-red-600 hover:text-red-700 bg-transparent"
                                onClick={() => handleDeleteProduct(product._id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        onSuccess={fetchProducts}
      />
    </>
  )
}
