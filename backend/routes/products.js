import express from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import Product from "../models/Product.js"
import { authenticateToken } from "../middleware/auth.js"
import { uploadBufferToCloudinary } from "../utils/cloudinary.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const storage = multer.memoryStorage()
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

// Get all products with filtering
router.get("/", async (req, res) => {
  try {
    const { category, style, minPrice, maxPrice, occasion, designer, search, page = 1, limit = 20, gender } = req.query

    // Build filter object
    const filter = { inStock: true }

    if (category) filter.category = category
    if (style) filter.style = style
    if (occasion) filter.occasions = { $in: [occasion] }
    if (designer) filter.designer = designer
    if (gender && ["men", "women", "unisex"].includes(String(gender))) filter.gender = gender

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number.parseInt(minPrice)
      if (maxPrice) filter.price.$lte = Number.parseInt(maxPrice)
    }

    // Text search
    if (search) {
      filter.$text = { $search: search }
    }

    const products = await Product.find(filter)
      .populate("designer", "name businessName location")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(filter)

    res.json({
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message })
  }
})

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "designer",
      "name businessName description location contact",
    )

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message })
  }
})

router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, subcategory, materials, occasions, style, colors, gender, link } =
      req.body

    console.log("[v0] 📝 Product form data received:", {
      name,
      description,
      price,
      category,
      subcategory,
      materials,
      occasions,
      style,
      colors,
      link,
    })

    if (!name || !price || !category || !materials || !colors || !occasions || !link || !style) {
      return res.status(400).json({
        message: "Missing required fields: name, price, category, materials, colors, occasions, link, and style",
      })
    }

    let uploadedImage // hold uploaded image meta for DB
    if (req.file?.buffer) {
      const result = await uploadBufferToCloudinary(req.file.buffer, { folder: "products" })
      console.log("[v0] ☁️ Uploaded to Cloudinary:", result.secure_url)
      uploadedImage = {
        url: result.secure_url,
        filename: result.original_filename || result.public_id,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      }
    }

    const validOccasions = ["daily", "office", "party", "wedding", "festival"]
    let processedOccasions = ["daily"] // default

    if (occasions) {
      const occasionList = Array.isArray(occasions)
        ? occasions
        : occasions.split(",").map((o) => o.trim().toLowerCase())
      processedOccasions = occasionList
        .map((occasion) => {
          // Map frontend values to backend enum values
          switch (occasion) {
            case "casual":
              return "daily"
            case "formal":
              return "office"
            case "party":
              return "party"
            case "wedding":
              return "wedding"
            case "festival":
              return "festival"
            default:
              return "daily"
          }
        })
        .filter((o) => validOccasions.includes(o))

      if (processedOccasions.length === 0) {
        processedOccasions = ["daily"]
      }
    }

    // const validStyles = ["traditional", "modern", "fusion", "minimalist"]
    // let processedStyle = "traditional" // default

    // if (style) {
    //   const styleValue = style.toLowerCase()
    //   switch (styleValue) {
    //     case "vintage":
    //       processedStyle = "traditional"
    //       break
    //     case "traditional":
    //       processedStyle = "traditional"
    //       break
    //     case "modern":
    //       processedStyle = "modern"
    //       break
    //     case "fusion":
    //       processedStyle = "fusion"
    //       break
    //     case "minimalist":
    //       processedStyle = "minimalist"
    //       break
    //     default:
    //       processedStyle = "traditional"
    //   }
    // }

    const validMaterials = [
      "gold",
      "silver",
      "platinum",
      "diamond",
      "pearl",
      "gemstone",
      "artificial",
      "kundan",
      "meenakari",
      "polki",
      "jadau",
      "brass",
      "copper",
      "ruby",
      "emerald",
      "sapphire",
    ]
    let processedMaterials = ["gold"] // default

    if (materials) {
      const materialList = Array.isArray(materials)
        ? materials
        : materials.split(",").map((m) => m.trim().toLowerCase())
      processedMaterials = materialList.filter((m) => validMaterials.includes(m))

      if (processedMaterials.length === 0) {
        processedMaterials = ["gold"]
      }
    }
    const validStyles = ["traditional", "modern", "fusion", "minimalist"]
    let processedStyles = []

    if (style) {
      const styleList = Array.isArray(style) ? style : style.split(",").map((s) => s.trim().toLowerCase())
      processedStyles = styleList.filter((s) => validStyles.includes(s))

      if (processedStyles.length === 0) {
        return res.status(400).json({ message: "At least one valid style is required" })
      }
    }

    console.log("[v0] 🔄 Processed data:", {
      occasions: processedOccasions,
      styles: processedStyles,
      materials: processedMaterials,
      subcategory,
    })

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      subcategory, // Added subcategory field
      materials: processedMaterials,
      occasions: processedOccasions,
      colors: colors ? (Array.isArray(colors) ? colors : colors.split(",").map((c) => c.trim())) : ["gold"],
      style: processedStyles,
      images: uploadedImage ? [uploadedImage] : [],
      designer: req.user.id,
      inStock: true,
      gender: ["men", "women", "unisex"].includes((gender || "").toLowerCase()) ? gender.toLowerCase() : "unisex",
      link: link || undefined,
    })

    await product.save()
    console.log("[v0] ✅ Product created successfully:", product.name)
    res.status(201).json({ message: "Product created successfully", product })
  } catch (error) {
    console.error("[v0] ❌ Product creation error:", error)
    res.status(500).json({ message: "Failed to create product", error: error.message })
  }
})

router.put("/:id", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, subcategory, materials, occasions, style, colors, gender, link } =
      req.body

    const updateData = {
      name,
      description,
      price: Number(price),
      category,
      subcategory,
      materials: materials
        ? Array.isArray(materials)
          ? materials
          : materials.split(",").map((m) => m.trim())
        : undefined,
      occasions: occasions
        ? Array.isArray(occasions)
          ? occasions
          : occasions.split(",").map((o) => o.trim())
        : undefined,
      colors: colors ? (Array.isArray(colors) ? colors : colors.split(",").map((c) => c.trim())) : undefined,
      style,
      gender:
        gender && ["men", "women", "unisex"].includes(String(gender).toLowerCase())
          ? String(gender).toLowerCase()
          : undefined,
      link: link || undefined,
    }

    const updateOps = { ...updateData }

    if (req.file?.buffer) {
      const result = await uploadBufferToCloudinary(req.file.buffer, { folder: "products" })
      console.log("[v0] ☁️ Updated image to Cloudinary:", result.secure_url)
      updateOps.$push = {
        images: {
          url: result.secure_url,
          filename: result.original_filename || result.public_id,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        },
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateOps, { new: true, runValidators: true })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product updated successfully", product })
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message })
  }
})

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message })
  }
})

export default router
