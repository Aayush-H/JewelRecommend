import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Designer from "../models/Designer.js"

const router = express.Router()

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" })
}

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create user
    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message })
  }
})

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = generateToken(user._id)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message })
  }
})

// Designer Registration
router.post("/designer/register", async (req, res) => {
  try {
    const { name, email, password, businessName, description, location, contact, specialties } = req.body

    const existingDesigner = await Designer.findOne({ email })
    if (existingDesigner) {
      return res.status(400).json({ message: "Designer already exists" })
    }

    const designer = await Designer.create({
      name,
      email,
      password,
      businessName,
      description,
      location,
      contact,
      specialties,
    })

    const token = generateToken(designer._id)

    res.status(201).json({
      message: "Designer registered successfully",
      token,
      designer: {
        id: designer._id,
        name: designer.name,
        businessName: designer.businessName,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Designer registration failed", error: error.message })
  }
})

router.post("/designer/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const designer = await Designer.findOne({ email })
    if (!designer || !(await designer.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = generateToken(designer._id)

    res.json({
      message: "Login successful",
      token,
      designer: {
        id: designer._id,
        name: designer.name,
        businessName: designer.businessName,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message })
  }
})

export default router
