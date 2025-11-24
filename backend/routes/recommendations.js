import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"
import { fileURLToPath } from "url"
import { extractColorsFromBuffer, getRecommendations, convertBudgetRange } from "../utils/recommendationEngine.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/user-images"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// Create a separate in-memory upload for analyze
const inMemoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true)
    else cb(new Error("Only image files are allowed"))
  },
})

// Upload image and get recommendations
router.post("/analyze", inMemoryUpload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" })
    }

    const { occasion = "daily", style = "modern", budget = "medium", material, category, gender = "unisex" } = req.body

    console.log(" Received recommendation request (in-memory analyze)")
    console.log(" Occasion:", occasion)
    console.log(" Style:", style)
    console.log(" Budget (raw):", budget)
    console.log(" Material:", material)
    console.log(" Category:", category)
    console.log(" Gender:", gender)

    // Process image entirely in memory (no disk writes)
    const dominantColors = await extractColorsFromBuffer(req.file.buffer)

    const numericBudget = convertBudgetRange(budget)
    console.log(" Converted budget:", numericBudget)

    const recommendations = await getRecommendations({
      colors: dominantColors,
      occasion,
      style,
      budget: numericBudget,
      material,
      category,
      gender,
    })

    // Response no longer contains imageUrl (nothing was stored)
    res.json({
      message: "Image analyzed successfully",
      analysis: {
        dominantColors,
      },
      recommendations,
      preferences: { occasion, style, budget, material, category, gender },
    })
  } catch (error) {
    console.error("Analysis error:", error)
    res.status(500).json({ message: "Analysis failed", error: error.message })
  }
})

// Get recommendations without image (based on preferences only)
router.post("/suggest", async (req, res) => {
  try {
    const { occasion, style, budget, category, material, gender = "unisex" } = req.body

    const numericBudget = convertBudgetRange(budget)

    const recommendations = await getRecommendations({
      occasion,
      style,
      budget: numericBudget,
      category,
      material,
      gender,
    })

    res.json({
      message: "Recommendations generated",
      recommendations,
      preferences: { occasion, style, budget: numericBudget, category, material, gender },
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to get recommendations", error: error.message })
  }
})

export default router
