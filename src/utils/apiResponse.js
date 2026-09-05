import { HTTP_STATUS, USER_ROLES } from '../config/constants.js'

export const successResponse = (res, data, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const createdResponse = (res, data, message = 'Created successfully') => {
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message,
    data,
  })
}

export const errorResponse = (res, message = 'Something went wrong', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  })
}
