import mongoose from 'mongoose'

// Tokens are encrypted before being stored and are never selected or returned by
// the public status endpoints.
const googleDriveConnectionSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  accessTokenEncrypted: { type: String, required: true, select: false },
  refreshTokenEncrypted: { type: String, select: false },
  tokenExpiry: { type: Date },
  email: { type: String, trim: true, lowercase: true },
  displayName: { type: String, trim: true },
  storage: {
    limit: { type: String },
    usage: { type: String },
    usageInDrive: { type: String },
  },
  rootFolderId: { type: String },
  lastVerifiedAt: { type: Date },
}, { timestamps: true })

export default mongoose.model('GoogleDriveConnection', googleDriveConnectionSchema)
