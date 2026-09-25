import { asyncHandler } from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { sendContactEmail } from '../services/emailService.js'

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body

  if (!name || !email || !subject || !message) {
    return errorResponse(res, 'All fields are required', 400)
  }

  const recipient = process.env.CONTACT_EMAIL

  if (!recipient) {
    return errorResponse(res, 'Contact email is not configured', 500)
  }

  await sendContactEmail({
    to: recipient,
    name,
    email,
    subject,
    message,
  })

  return successResponse(
    res,
    null,
    'Your message has been sent successfully'
  )
})