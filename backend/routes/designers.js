import express from "express"
import Designer from "../models/Designer.js"
import bcrypt from "bcryptjs"

const router = express.Router()

// Get all designers
router.get("/", async (req, res) => {
  try {
    const { city, specialty, verified } = req.query

    const filter = {}
    if (city) filter["location.city"] = new RegExp(city, "i")
    if (specialty) filter.specialties = { $in: [specialty] }
    if (verified !== undefined) filter.verified = verified === "true"

    const designers = await Designer.find(filter)
      .select("-password")
      .populate("products", "name price category images")
      .sort({ "rating.average": -1 })

    res.json(designers)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch designers", error: error.message })
  }
})

// Get single designer
router.get("/:id", async (req, res) => {
  try {
    const designer = await Designer.findById(req.params.id).select("-password").populate("products")

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" })
    }

    res.json(designer)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch designer", error: error.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const { name, email, password, businessName, description, location, contact, specialties } = req.body

    // Check if designer already exists
    const existingDesigner = await Designer.findOne({ email })
    if (existingDesigner) {
      return res.status(400).json({ message: "Designer with this email already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const designer = new Designer({
      name,
      email,
      password: hashedPassword,
      businessName,
      description,
      location,
      contact,
      specialties: specialties || ["traditional"],
      verified: false,
      rating: { average: 0, count: 0 },
    })

    await designer.save()

    // Remove password from response
    const designerResponse = designer.toObject()
    delete designerResponse.password

    res.status(201).json({ message: "Designer created successfully", designer: designerResponse })
  } catch (error) {
    res.status(500).json({ message: "Failed to create designer", error: error.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const { name, businessName, description, location, contact, specialties } = req.body

    const designer = await Designer.findByIdAndUpdate(
      req.params.id,
      { name, businessName, description, location, contact, specialties },
      { new: true, runValidators: true },
    ).select("-password")

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" })
    }

    res.json({ message: "Designer updated successfully", designer })
  } catch (error) {
    res.status(500).json({ message: "Failed to update designer", error: error.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const designer = await Designer.findByIdAndDelete(req.params.id)

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" })
    }

    res.json({ message: "Designer deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete designer", error: error.message })
  }
})

export default router
