import mongoose from "mongoose"

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // can be cloudinary secure_url or legacy relative url
    filename: { type: String, required: true },
    publicId: { type: String },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
  },
  { _id: false },
)

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      enum: ["necklace", "earrings", "bracelet", "ring", "anklet", "set"],
    },
    subcategory: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    images: {
      type: [ImageSchema],
      default: [],
    },
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designer",
      required: true,
    },
    materials: [
      {
        type: String,
        enum: [
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
          "white-gold",
          "rose-gold",
          "antique-gold"
        ],
      },
    ],
    colors: [
      {
        type: String,
        required: true,
      },
    ],
    style: {
      type: [String],
      enum: ["traditional", "modern", "fusion", "minimalist"],
      default: ["traditional"],
      required: true,
    },
    occasions: [
      {
        type: String,
        enum: ["daily", "office", "party", "wedding", "festival"],
      },
    ],
    gender: {
      type: String,
      enum: ["men", "women", "unisex"],
      default: "unisex",
    },
    link: {
      type: String,
      required: false,
      trim: true,
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  },
)

// Index for search optimization
productSchema.index({ name: "text", description: "text", tags: "text" })
productSchema.index({ category: 1, style: 1, price: 1 })

export default mongoose.model("Product", productSchema)
