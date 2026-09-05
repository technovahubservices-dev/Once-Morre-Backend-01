const rateLimitStore = new Map()

export const otpRateLimit = (req, res, next) => {
  const key = req.ip + ':' + (req.body.email || 'unknown')
  const now = Date.now()
  const windowMs = parseInt(process.env.RATE_LIMIT_OTP_WINDOW_MS) || 60000
  const maxRequests = parseInt(process.env.RATE_LIMIT_OTP_MAX_REQUESTS) || 3

  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs }

  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + windowMs
  }

  record.count += 1
  rateLimitStore.set(key, record)

  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    res.set('Retry-After', retryAfter.toString())
    return res.status(429).json({
      success: false,
      message: `Too many OTP requests. Please try again in ${retryAfter} seconds.`,
    })
  }

  next()
}

export const resetRateLimit = (req, res, next) => {
  const key = req.ip + ':' + (req.body.email || 'unknown')
  const now = Date.now()
  const windowMs = parseInt(process.env.RATE_LIMIT_RESET_WINDOW_MS) || 60000
  const maxRequests = parseInt(process.env.RATE_LIMIT_RESET_MAX_REQUESTS) || 5

  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs }

  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + windowMs
  }

  record.count += 1
  rateLimitStore.set(key, record)

  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    res.set('Retry-After', retryAfter.toString())
    return res.status(429).json({
      success: false,
      message: `Too many password reset attempts. Please try again in ${retryAfter} seconds.`,
    })
  }

  next()
}
