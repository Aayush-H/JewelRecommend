import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

// Import models
import User from "../models/User.js"
import Designer from "../models/Designer.js"
import Product from "../models/Product.js"

dotenv.config()

// Sample data
const sampleDesigners = [
  {
    name: "Priya Sharma",
    email: "priya@goldencrafts.com",
    password: "designer123",
    businessName: "Golden Crafts",
    description: "Traditional Indian jewelry with modern touch",
    location: { city: "Mumbai", state: "Maharashtra" },
    contact: { phone: "+91-9876543210", instagram: "@goldencrafts" },
    specialties: ["traditional", "bridal"],
    verified: true,
  },
  {
    name: "Arjun Patel",
    email: "arjun@modernjewels.com",
    password: "designer123",
    businessName: "Modern Jewels",
    description: "Contemporary and minimalist jewelry designs",
    location: { city: "Delhi", state: "Delhi" },
    contact: { phone: "+91-9876543211", instagram: "@modernjewels" },
    specialties: ["modern", "minimalist"],
    verified: true,
  },
]

const sampleProducts = [
  {
    name: "Royal Kundan Necklace Set",
    description: "Exquisite kundan necklace with matching earrings, perfect for weddings",
    category: "set",
    subcategory: "kundan-set",
    price: 25000,
    materials: ["gold", "kundan", "pearl"],
    colors: ["gold", "red", "white"],
    style: "traditional",
    occasions: ["wedding", "festival"],
    weight: 45,
    inStock: true,
    tags: ["kundan", "bridal", "heavy", "traditional"],
  },
  {
    name: "Diamond Solitaire Ring",
    description: "Classic diamond solitaire ring in white gold setting",
    category: "ring",
    subcategory: "solitaire",
    price: 45000,
    materials: ["white-gold", "diamond"],
    colors: ["silver", "white"],
    style: "modern",
    occasions: ["daily", "office", "party"],
    weight: 3,
    inStock: true,
    tags: ["diamond", "solitaire", "engagement", "modern"],
  },
  {
    name: "Pearl Drop Earrings",
    description: "Elegant pearl drop earrings with gold accents",
    category: "earrings",
    subcategory: "drop-earrings",
    price: 8000,
    materials: ["gold", "pearl"],
    colors: ["gold", "white"],
    style: "fusion",
    occasions: ["office", "party", "daily"],
    weight: 8,
    inStock: true,
    tags: ["pearl", "elegant", "office-wear", "fusion"],
  },
  {
    name: "Silver Oxidized Bangles",
    description: "Set of 4 oxidized silver bangles with traditional motifs",
    category: "bracelet",
    subcategory: "bangles",
    price: 3500,
    materials: ["silver"],
    colors: ["silver", "black"],
    style: "traditional",
    occasions: ["daily", "festival"],
    weight: 60,
    inStock: true,
    tags: ["silver", "oxidized", "traditional", "affordable"],
  },
  {
    name: "Rose Gold Chain Bracelet",
    description: "Delicate rose gold chain bracelet for everyday wear",
    category: "bracelet",
    subcategory: "chain-bracelet",
    price: 12000,
    materials: ["rose-gold"],
    colors: ["rose-gold", "pink"],
    style: "minimalist",
    occasions: ["daily", "office"],
    weight: 5,
    inStock: true,
    tags: ["rose-gold", "minimalist", "daily-wear", "delicate"],
  },
  {
    name: "Temple Jewelry Necklace",
    description: "Traditional South Indian temple jewelry necklace",
    category: "necklace",
    subcategory: "temple-jewelry",
    price: 18000,
    materials: ["gold", "ruby", "emerald"],
    colors: ["gold", "red", "green"],
    style: "traditional",
    occasions: ["wedding", "festival"],
    weight: 35,
    inStock: true,
    tags: ["temple", "south-indian", "traditional", "heavy"],
  },
  {
    name: "Geometric Stud Earrings",
    description: "Modern geometric stud earrings in sterling silver",
    category: "earrings",
    subcategory: "studs",
    price: 2500,
    materials: ["silver"],
    colors: ["silver"],
    style: "modern",
    occasions: ["daily", "office"],
    weight: 3,
    inStock: true,
    tags: ["geometric", "modern", "studs", "affordable"],
  },
  {
    name: "Antique Gold Choker",
    description: "Vintage-inspired antique gold choker necklace",
    category: "necklace",
    subcategory: "choker",
    price: 22000,
    materials: ["antique-gold"],
    colors: ["gold", "brown"],
    style: "fusion",
    occasions: ["party", "wedding"],
    weight: 25,
    inStock: true,
    tags: ["antique", "choker", "vintage", "fusion"],
  },
]

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/jewelry-app")
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Designer.deleteMany({})
    await Product.deleteMany({})
    console.log("Cleared existing data")

    // Create designers
    const createdDesigners = []
    for (const designerData of sampleDesigners) {
      const hashedPassword = await bcrypt.hash(designerData.password, 12)
      const designer = await Designer.create({
        ...designerData,
        password: hashedPassword,
      })
      createdDesigners.push(designer)
      console.log(`Created designer: ${designer.businessName}`)
    }

    // Create products and assign to designers
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i]
      const designer = createdDesigners[i % createdDesigners.length] // Distribute products among designers

      const product = await Product.create({
        ...productData,
        designer: designer._id,
      })

      // Add product to designer's products array
      await Designer.findByIdAndUpdate(designer._id, {
        $push: { products: product._id },
      })

      console.log(`Created product: ${product.name} for ${designer.businessName}`)
    }

    // Create a test user
    const testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 12),
      preferences: {
        style: "modern",
        budget: { min: 5000, max: 30000 },
        occasions: ["daily", "office", "party"],
      },
    })
    console.log("Created test user")

    console.log("\n✅ Database setup completed successfully!")
    console.log("\nSample Data Created:")
    console.log(`- ${createdDesigners.length} designers`)
    console.log(`- ${sampleProducts.length} products`)
    console.log("- 1 test user")

    console.log("\nTest Credentials:")
    console.log("User: test@example.com / password123")
    console.log("Designer 1: priya@goldencrafts.com / designer123")
    console.log("Designer 2: arjun@modernjewels.com / designer123")
  } catch (error) {
    console.error("Database setup failed:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

// Run the setup
setupDatabase()
