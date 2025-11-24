import { authAPI } from "./api"

export interface User {
  id: string
  name: string
  email: string
  role: "user" | "designer"
  isFirstTime?: boolean
  businessName?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
}

// Real authentication functions using backend API
export const signIn = async (email: string, password: string): Promise<User> => {
  const response = await authAPI.login(email, password)

  // Store token in localStorage
  localStorage.setItem("token", response.token)

  // Determine role based on response structure
  const role = response.designer ? "designer" : "user"
  const userData = response.designer || response.user

  const user: User = {
    id: userData.id,
    name: userData.name,
    email: userData.email || email,
    role,
    isFirstTime: role === "designer" && !userData.businessName,
    businessName: userData.businessName,
  }

  return user
}

export const signUp = async (
  name: string,
  email: string,
  password: string,
  role: "user" | "designer",
): Promise<User> => {
  const response = await authAPI.register(name, email, password, role)

  // Store token in localStorage
  localStorage.setItem("token", response.token)

  const userData = response.designer || response.user

  const user: User = {
    id: userData.id,
    name: userData.name,
    email: userData.email || email,
    role,
    isFirstTime: role === "designer",
    businessName: userData.businessName,
  }

  return user
}

export const signOut = async (): Promise<void> => {
  // Clear stored auth data
  localStorage.removeItem("user")
  localStorage.removeItem("token")
}
