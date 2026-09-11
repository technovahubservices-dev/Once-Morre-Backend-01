import mongoose from 'mongoose'

// A short-lived, one-time OAuth state binds Google's callback to the admin
// who initiated it without placing an admin JWT in the callback URL.
const googleDriveOAuthStateSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true, index: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true })

export default mongoose.model('GoogleDriveOAuthState', googleDriveOAuthStateSchema)
