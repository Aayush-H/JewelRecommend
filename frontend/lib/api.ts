// API utility layer for backend communication

export const API_URL = "https://jewelrecback.onrender.com" 
//export const API_URL = "http://localhost:5000"

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

// Helper function to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    // helper to call an endpoint and return { ok, status, json }
    const call = async (path: string) => {
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      let json: any = null
      try {
        json = await res.json()
      } catch {
        // ignore body parse errors
      }
      return { ok: res.ok, status: res.status, json }
    }

    // Try user login first
    const first = await call("/api/auth/login")
    if (first.ok) return first.json

    // If invalid for user, try designer login next
    if (first.status === 401 || first.status === 404) {
      const second = await call("/api/auth/designer/login")
      if (second.ok) return second.json
      // If designer also fails, throw designer error
      throw new Error(second.json?.message || "Invalid credentials")
    }

    // Any other error from user login
    throw new Error(first.json?.message || "Login failed")
  },

  register: async (name: string, email: string, password: string, role: "user" | "designer") => {
    const endpoint = role === "designer" ? "/api/auth/designer/register" : "/api/auth/register"

    const body =
      role === "designer"
        ? {
            name,
            email,
            password,
            businessName: name, // Default to name, can be updated later
            description: "",
            location: { city: "", state: "", country: "India" },
            contact: {},
            specialties: ["traditional"],
          }
        : { name, email, password }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    return response.json()
  },
}

// Products API
export const productsAPI = {
  getAll: async (filters?: {
    category?: string
    style?: string
    minPrice?: number
    maxPrice?: number
    occasion?: string
    designer?: string
    search?: string
    page?: number
    limit?: number
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return fetchWithAuth(`/api/products?${params.toString()}`)
  },

  getById: async (id: string) => {
    return fetchWithAuth(`/api/products/${id}`)
  },

  create: async (formData: FormData) => {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Don't set Content-Type for FormData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create product")
    }

    return response.json()
  },

  update: async (id: string, formData: FormData) => {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update product")
    }

    return response.json()
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/api/products/${id}`, { method: "DELETE" })
  },
}

// Designers API
export const designersAPI = {
  getAll: async (filters?: { city?: string; specialty?: string; verified?: boolean }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return fetchWithAuth(`/api/designers?${params.toString()}`)
  },

  getById: async (id: string) => {
    return fetchWithAuth(`/api/designers/${id}`)
  },

  update: async (
    id: string,
    data: {
      name?: string
      businessName?: string
      description?: string
      location?: { city?: string; state?: string; country?: string }
      contact?: { phone?: string; whatsapp?: string; instagram?: string; website?: string }
      specialties?: string[]
    },
  ) => {
    return fetchWithAuth(`/api/designers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
}

// Recommendations API
export const recommendationsAPI = {
  analyzeImage: async (formData: FormData) => {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/api/recommendations/analyze`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to analyze image")
    }

    return response.json()
  },

  getSuggestions: async (preferences: {
    occasion?: string
    style?: string
    budget?: string | number
    category?: string
    materials?: string
    gender?: "men" | "women" | "unisex"
  }) => {
    return fetchWithAuth("/api/recommendations/suggest", {
      method: "POST",
      body: JSON.stringify(preferences),
    })
  },
}

// Analytics API
export const analyticsAPI = {
  logEvent: async (event: string, metadata?: Record<string, unknown>) => {
    return fetchWithAuth(`/api/analytics/events`, {
      method: "POST",
      body: JSON.stringify({
        event,
        metadata,
        ts: Date.now(),
      }),
    })
  },
}