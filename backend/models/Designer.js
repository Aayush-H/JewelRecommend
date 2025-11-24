import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const designerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    description: String,
    location: {
      city: String,
      state: String,
      country: { type: String, default: "India" },
    },
    contact: {
      phone: String,
      whatsapp: String,
      instagram: String,
      website: String,
    },
    specialties: [
      {
        type: String,
        enum: ["traditional", "modern", "fusion", "minimalist", "bridal", "daily-wear"],
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  },
)

designerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

designerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model("Designer", designerSchema)
