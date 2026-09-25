import SiteSettings from '../models/SiteSettings.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getSiteSettings = asyncHandler(async (req, res)=> {
  let settings = await SiteSettings.findOne()

  if (!settings) {
    settings = await SiteSettings.create({
      contactEmail: process.env.CONTACT_EMAIL || '',
      announcements: [],
    })
  }

  return successResponse(res, settings, 'Site settings fetched successfully')
})

export const updateSiteSettings = asyncHandler(async (req, res) => {
  const { contactEmail, announcements } = req.body

  if (!contactEmail) {
    return errorResponse(res, 'Contact email is required', 400)
  }

  let settings = await SiteSettings.findOne()

  if (!settings) {
    settings = await SiteSettings.create({
      contactEmail,
      announcements: Array.isArray(announcements)
        ? announcements.filter(item => typeof item === 'string' && item.trim())
        : [],
    })
  } else {
    settings.contactEmail = contactEmail

    if (Array.isArray(announcements)) {
      settings.announcements = announcements.filter(
        item => typeof item === 'string' && item.trim()
      )
    }

    await settings.save()
  }

  return successResponse(res, settings, 'Site settings updated successfully')
})
