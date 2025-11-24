import sharp from "sharp"
import Product from "../models/Product.js"

// Extract dominant colors from image
async function extractColors(imagePath) {
  try {
    console.log(" Starting color extraction from image:", imagePath)

    // Resize image and get raw pixel data
    const { data, info } = await sharp(imagePath).resize(100, 100).raw().toBuffer({ resolveWithObject: true })

    // Simple color extraction (you can enhance this with better algorithms)
    const colors = []
    const colorCounts = {}

    // Sample pixels and count colors
    for (let i = 0; i < data.length; i += 12) {
      // Sample every 4th pixel
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Convert to hex
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`

      // Group similar colors
      const colorGroup = getColorGroup(r, g, b)
      colorCounts[colorGroup] = (colorCounts[colorGroup] || 0) + 1
    }

    // Get top 3 dominant color groups
    const sortedColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color)

    console.log(" Top 3 dominant colors extracted:", sortedColors)
    return sortedColors
  } catch (error) {
    console.error(" Color extraction error:", error)
    return ["neutral"] // Fallback
  }
}

// Extract dominant colors from buffer
async function extractColorsFromBuffer(buffer) {
  try {
    console.log(" Starting color extraction from buffer (in-memory)")

    const { data, info } = await sharp(buffer).resize(100, 100).raw().toBuffer({ resolveWithObject: true })

    const colorCounts = {}
    // Sample pixels and count colors
    for (let i = 0; i < data.length; i += 12) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const colorGroup = getColorGroup(r, g, b)
      colorCounts[colorGroup] = (colorCounts[colorGroup] || 0) + 1
    }

    const sortedColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color)

    console.log(" Top 3 dominant colors extracted (buffer):", sortedColors)
    return sortedColors
  } catch (error) {
    console.error(" Color extraction (buffer) error:", error)
    return ["neutral"]
  }
}

// Group colors into categories
function getColorGroup(r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  // Check for grayscale
  if (diff < 30) {
    if (max < 80) {
      return "black"
    }
    if (max > 200) {
      return "white"
    }
    return "gray"
  }

  // Determine dominant color
  if (r > g && r > b) {
    const result = g > 100 ? "orange" : "red"
    return result
  } else if (g > r && g > b) {
    const result = b > 100 ? "teal" : "green"
    return result
  } else if (b > r && b > g) {
    const result = r > 100 ? "purple" : "blue"
    return result
  }
  return "neutral"
}

function convertBudgetRange(budgetRange) {
  const budgetMap = {
    low: 10000,
    medium: 50000,
    high: 100000,
  }

  // If it's already a number, return it
  if (!isNaN(Number(budgetRange))) {
    return Number(budgetRange)
  }

  // If it's a string range, convert it
  if (typeof budgetRange === "string" && budgetMap[budgetRange.toLowerCase()]) {
    return budgetMap[budgetRange.toLowerCase()]
  }

  return null
}

// Main recommendation engine
async function getRecommendations({
  colors = [],
  occasion = "daily",
  style = "modern",
  budget = 10000,
  category = null,
  material = null,
  gender = "unisex",
}) {
  try {
    console.log(" Starting recommendation engine with preferences:")

    const validBudget = convertBudgetRange(budget)

  // Base query (always true conditions)
    let baseQuery = { inStock: true }
    if (validBudget !== null && validBudget > 0) {
      baseQuery.price = { $lte: validBudget }
    }

    // Add filters dynamically
    if (style) baseQuery.style = style
    if (occasion) baseQuery.occasions = { $in: [occasion] }
    if (category) baseQuery.category = category
    if (material) baseQuery.materials = { $in: [material] }
    if (gender && ["men", "women"].includes(String(gender))) {
      baseQuery.gender = { $in: [gender, "unisex"] }
    }

    // Add color query if provided
    if (colors.length > 0) {
      const complementaryColors = getComplementaryColors(colors)
      baseQuery.$or = [
        { colors: { $in: colors } },
        { colors: { $in: complementaryColors } },
      ]
    }

    console.log("🧾 Initial MongoDB Query:", JSON.stringify(baseQuery, null, 2))

    // Try progressively relaxing filters
    const relaxationOrder = [
      "$or", // color
      "materials",
      "occasions",
      "style",
      "category",
      "gender",
    ]

    let products = []
    let query = { ...baseQuery }

    for (let i = 0; i <= relaxationOrder.length; i++) {
      console.log(`\n🔄 Relaxation attempt ${i + 1}: current filters ->`, Object.keys(query))

      products = await Product.find(query)
        .populate("designer", "name businessName location")
        .sort({ createdAt: -1 })
        .limit(20)

      console.log(`   → Found ${products.length} products`)

      if (products.length > 0) {
        console.log("✅ Matches found, stopping relaxation.")
        break
      }

      if (i < relaxationOrder.length) {
        const filterToRemove = relaxationOrder[i]
        delete query[filterToRemove]
        console.log(`⚠️  No matches, relaxing filter: ${filterToRemove}`)
      }
    }

    if (products.length === 0) {
      console.warn("🚨 No products found even after all relaxations.")
      return []
    }

    // Scoring & sorting recommendations
    console.log("🎯 Calculating recommendation scores...")
    const scoredProducts = products.map((product) => {
      const score = calculateRecommendationScore(product, {
        colors,
        occasion,
        style,
        budget: validBudget || 50000,
        material,
        category,
        gender,
      })
      return { ...product.toObject(), score }
    })

    const finalRecommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)

    console.log("\n🏆 Top recommendations:")
    finalRecommendations.forEach((p, i) =>
      console.log(`${i + 1}. ${p.name} - ₹${p.price} - Score: ${p.score.toFixed(2)}`)
    )

    return finalRecommendations
  } catch (error) {
    console.error("❌ Recommendation error:", error)
    return []
  }
}

// Calculate recommendation score
function calculateRecommendationScore(product, preferences) {
  let score = 0
  const breakdown = {}

  console.log(` Scoring "${product.name}"...`)

  // Color matching score (30% weight - reduced from 40%)
  if (preferences.colors && preferences.colors.length > 0) {
    const directMatches = product.colors.filter((color) => preferences.colors.includes(color))
    const complementaryMatches = product.colors.filter((color) =>
      getComplementaryColors(preferences.colors).includes(color),
    )

    const totalMatches = [...new Set([...directMatches, ...complementaryMatches])].length
    const colorScore = (totalMatches / Math.max(preferences.colors.length, 1)) * 30

    breakdown.colorScore = colorScore
    score += colorScore

    console.log(` Color Analysis:`)
    console.log(` Product colors: [${product.colors.join(", ")}]`)
    console.log(` Direct matches: [${directMatches.join(", ")}]`)
    console.log(` Complementary matches: [${complementaryMatches.join(", ")}]`)
    console.log(` Color score: ${colorScore.toFixed(2)}/30`)
  }

  // Style matching (20% weight - reduced from 25%)
  if (product.style === preferences.style) {
    breakdown.styleScore = 20
    score += 20
    console.log(` Style match: ${product.style} = +20 points`)
  } else {
    breakdown.styleScore = 0
    console.log(` Style mismatch: ${product.style} vs ${preferences.style} = +0 points`)
  }

  // Occasion matching (15% weight - reduced from 20%)
  if (product.occasions.includes(preferences.occasion)) {
    breakdown.occasionScore = 15
    score += 15
    console.log(` Occasion match: ${preferences.occasion} in [${product.occasions.join(", ")}] = +15 points`)
  } else {
    breakdown.occasionScore = 0
    console.log(
      ` Occasion mismatch: ${preferences.occasion} not in [${product.occasions.join(", ")}] = +0 points`,
    )
  }

  // Material matching (20% weight - NEW)
  if (preferences.material) {
    if (product.materials.includes(preferences.material)) {
      breakdown.materialScore = 20
      score += 20
      console.log(` Material match: ${preferences.material} in [${product.materials.join(", ")}] = +20 points`)
    } else {
      breakdown.materialScore = 0
      console.log(
        ` Material mismatch: ${preferences.material} not in [${product.materials.join(", ")}] = +0 points`,
      )
    }
  }

  // Category matching (10% weight - NEW)
  if (preferences.category) {
    if (product.category === preferences.category) {
      breakdown.categoryScore = 10
      score += 10
      console.log(` Category match: ${preferences.category} = +10 points`)
    } else {
      breakdown.categoryScore = 0
      console.log(` Category mismatch: ${product.category} vs ${preferences.category} = +0 points`)
    }
  }

  // Gender alignment (10% weight)
  if (preferences.gender) {
    if (product.gender === preferences.gender) {
      score += 10
      breakdown.genderScore = 10
      console.log(` Gender match: ${preferences.gender} = +10 points`)
    } else if (product.gender === "unisex") {
      score += 6 // partial credit for unisex
      breakdown.genderScore = 6
      console.log(` Gender soft match (unisex): +6 points`)
    } else {
      breakdown.genderScore = 0
      console.log(` Gender mismatch: ${product.gender} vs ${preferences.gender} = +0 points`)
    }
  }

  // Price appropriateness (5% weight - reduced from 15%)
  const priceRatio = product.price / preferences.budget
  let priceScore = 0
  if (priceRatio <= 0.5) priceScore = 5
  else if (priceRatio <= 0.8) priceScore = 3
  else if (priceRatio <= 1.0) priceScore = 1

  breakdown.priceScore = priceScore
  score += priceScore
  console.log(
    ` Price analysis: ₹${product.price}/₹${preferences.budget} (${(priceRatio * 100).toFixed(1)}%) = +${priceScore} points`,
  )

  console.log(` Total score: ${score.toFixed(2)}/100`)
  return score
}

// Get complementary colors
function getComplementaryColors(colors) {
  const complementaryMap = {
    red: ["gold", "green", "white"],
    blue: ["silver", "white", "gold"],
    green: ["gold", "red", "white"],
    yellow: ["blue", "purple", "silver"],
    orange: ["blue", "teal", "gold"],
    purple: ["yellow", "gold", "silver"],
    pink: ["green", "gold", "silver"],
    black: ["gold", "silver", "white"],
    white: ["gold", "silver", "black"],
    gray: ["gold", "silver", "blue"],
    gold: ["red", "green", "blue"],
    silver: ["blue", "purple", "black"],
  }

  const complementary = []
  colors.forEach((color) => {
    if (complementaryMap[color]) {
      complementary.push(...complementaryMap[color])
    }
  })

  return [...new Set(complementary)] // Remove duplicates
}

export { extractColors, extractColorsFromBuffer, getRecommendations, calculateRecommendationScore, convertBudgetRange }
