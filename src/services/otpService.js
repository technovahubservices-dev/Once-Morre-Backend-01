import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'

const otpStore = new Map()

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const storeOTP = (email, otp, expiresInMinutes = 10) => {
  const resetToken = jwt.sign(
    { email, type: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: `${expiresInMinutes}m` }
  )
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  otpStore.set(email, {
    otp,
    resetToken,
    expiresAt,
    createdAt: new Date(),
  })

  return { otp, resetToken }
}

export const verifyOTP = (email, otp) => {
  const record = otpStore.get(email)
  if (!record) {
    return { success: false, message: 'OTP not found. Please request a new one.' }
  }

  if (new Date() > record.expiresAt) {
    otpStore.delete(email)
    return { success: false, message: 'OTP has expired. Please request a new one.' }
  }

  if (record.otp !== otp) {
    return { success: false, message: 'Invalid OTP. Please try again.' }
  }

  return { success: true, resetToken: record.resetToken }
}

export const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.type !== 'password-reset') {
      return { success: false, message: 'Invalid reset token' }
    }
    return { success: true, email: decoded.email }
  } catch (error) {
    return { success: false, message: 'Invalid or expired reset token' }
  }
}

export const clearOTP = (email) => {
  otpStore.delete(email)
}

export const cleanupExpiredOTPs = () => {
  const now = new Date()
  for (const [email, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(email)
    }
  }
}

setInterval(cleanupExpiredOTPs, 5 * 60 * 1000)
