import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
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
      minlength: 6,
    },
    preferences: {
      style: {
        type: String,
        enum: ["traditional", "modern", "fusion", "minimalist"],
        default: "modern",
      },
      budget: {
        min: { type: Number, default: 1000 },
        max: { type: Number, default: 50000 },
      },
      occasions: [
        {
          type: String,
          enum: ["daily", "office", "party", "wedding", "festival"],
        },
      ],
    },
    uploadedImages: [
      {
        filename: String,
        originalName: String,
        uploadDate: { type: Date, default: Date.now },
        dominantColors: [String],
        recommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model("User", userSchema)
