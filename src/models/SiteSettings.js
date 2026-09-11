import mongoose from 'mongoose'

const siteSettingsSchema = new mongoose.Schema(
  {
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    announcements: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
)

export default mongoose.model('SiteSettings', siteSettingsSchema)

