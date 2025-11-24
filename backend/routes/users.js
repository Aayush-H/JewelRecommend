import express from "express"
import User from "../models/User.js"

const router = express.Router()

// Get user profile (would need auth middleware in production)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("uploadedImages.recommendations", "name price images")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message })
  }
})

// Update user preferences
router.put("/:id/preferences", async (req, res) => {
  try {
    const { style, budget, occasions } = req.body

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "preferences.style": style,
          "preferences.budget": budget,
          "preferences.occasions": occasions,
        },
      },
      { new: true },
    ).select("-password")

    res.json({ message: "Preferences updated", user })
  } catch (error) {
    res.status(500).json({ message: "Failed to update preferences", error: error.message })
  }
})

export default router
