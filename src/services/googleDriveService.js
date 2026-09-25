import crypto from 'crypto'
import { google } from 'googleapis'
import { Readable } from 'stream'

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

const requiredConfig = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_TOKEN_ENCRYPTION_KEY } = process.env
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI || !GOOGLE_TOKEN_ENCRYPTION_KEY) {
    throw new Error('Google Drive integration is not configured')
  }
  return { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_TOKEN_ENCRYPTION_KEY }
}

const encryptionKey = () => crypto.createHash('sha256')
  .update(requiredConfig().GOOGLE_TOKEN_ENCRYPTION_KEY)
  .digest()

export const encryptToken = token => {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join('.')
}

export const decryptToken = encryptedToken => {
  const [iv, authTag, encrypted] = encryptedToken.split('.')
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(authTag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]).toString('utf8')
}

export const createOAuthClient = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = requiredConfig()
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
}

export const authorizationUrl = state => createOAuthClient().generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [DRIVE_SCOPE],
  state,
})

export const createDriveClient = connection => {
  const auth = createOAuthClient()
  auth.setCredentials({
    access_token: decryptToken(connection.accessTokenEncrypted),
    refresh_token: connection.refreshTokenEncrypted ? decryptToken(connection.refreshTokenEncrypted) : undefined,
    expiry_date: connection.tokenExpiry?.getTime(),
  })
  return google.drive({ version: 'v3', auth })
}

export const getDriveInfo = async connection => {
  const drive = createDriveClient(connection)
  const response = await drive.about.get({
    fields: 'user(emailAddress,displayName),storageQuota(limit,usage,usageInDrive)',
  })
  return {
    email: response.data.user?.emailAddress,
    displayName: response.data.user?.displayName,
    storage: response.data.storageQuota ? {
      limit: response.data.storageQuota.limit,
      usage: response.data.storageQuota.usage,
      usageInDrive: response.data.storageQuota.usageInDrive,
    } : undefined,
  }
}

// Only credential failures should cause a locally stored connection to be
// removed. Transient Google/network failures must not disconnect an admin.
export const isInvalidDriveCredentialError = error => {
  const status = error?.response?.status || error?.code
  const reason = error?.response?.data?.error
  const message = typeof reason === 'string' ? reason : reason?.message || error?.message || ''
  return status === 401 || /invalid_grant|invalid credentials|invalid token|token has been expired/i.test(message)
}

const getFolderId = async (drive, name, parentId) => {
  const query = [
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
    `name = '${name.replace(/'/g, "\\'")}'`,
    parentId ? `'${parentId}' in parents` : null,
  ].filter(Boolean).join(' and ')

  const result = await drive.files.list({
    q: query,
    fields: 'files(id,name)',
    spaces: 'drive',
  })

  return result.data.files?.[0]?.id || null
}

export const uploadImageToDrive = async (connection, file) => {
  if (!file?.buffer) {
    throw new Error('Image file is required')
  }

  const drive = createDriveClient(connection)

  const rootFolderId = connection.rootFolderId ||
    await getOrCreateFolder(drive, 'Once Morre')

  const websiteFolderId = await getFolderId(drive, 'Website', rootFolderId)
  if (!websiteFolderId) {
    throw new Error('Website folder not found in Google Drive')
  }

  const imagesFolderId = await getFolderId(drive, 'Images', websiteFolderId)
  if (!imagesFolderId) {
    throw new Error('Images folder not found in Google Drive')
  }

  const productsFolderId = await getFolderId(drive, 'Products', imagesFolderId)
  if (!productsFolderId) {
    throw new Error('Products folder not found in Google Drive')
  }

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      parents: [productsFolderId],
    },
    media: {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer),
    },
    fields: 'id,name,mimeType,size,webViewLink,webContentLink',
  })

  const fileId = response.data.id

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  return {
    fileId,
    fileName: response.data.name,
    mimeType: response.data.mimeType,
    size: response.data.size,
    url: `https://drive.google.com/uc?export=view&id=${fileId}`,
    webViewLink: response.data.webViewLink || null,
  }
}
const getOrCreateFolder = async (drive, name, parentId) => {
  const query = [
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
    `name = '${name.replace(/'/g, "\\'")}'`,
    parentId ? `'${parentId}' in parents` : null,
  ].filter(Boolean).join(' and ')

  const existing = await drive.files.list({ q: query, fields: 'files(id)', spaces: 'drive' })
  if (existing.data.files?.[0]?.id) return existing.data.files[0].id

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] }),
    },
    fields: 'id',
  })
  return created.data.id
}

// Creates only empty folders; no website files are uploaded during connection.
export const uploadProductImageToDrive = async (connection, file) => {
  const drive = createDriveClient(connection)

  const website = await getOrCreateFolder(drive, 'Website', connection.rootFolderId)
  const images = await getOrCreateFolder(drive, 'Images', website)
  const products = await getOrCreateFolder(drive, 'Products', images)

  const { Readable } = await import('stream')

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      parents: [products],
    },
    media: {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer),
    },
    fields: 'id,name',
  })

  const fileId = response.data.id

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  return {
    id: fileId,
    name: response.data.name,
    url: `https://drive.google.com/uc?export=view&id=${fileId}`,
  }
}
export const prepareDriveFolders = async connection => {
  const drive = createDriveClient(connection)
  const root = await getOrCreateFolder(drive, 'Once Morre')
  const website = await getOrCreateFolder(drive, 'Website', root)
  const images = await getOrCreateFolder(drive, 'Images', website)
  const videos = await getOrCreateFolder(drive, 'Videos', website)

  await Promise.all([
    ...['Banner', 'Products', 'Variants', 'Gallery', 'Blogs'].map(name => getOrCreateFolder(drive, name, images)),
    ...['Banners', 'Products', 'Promotional'].map(name => getOrCreateFolder(drive, name, videos)),
  ])
  return root
}

export const getDriveImage = async (connection, fileId) => {
  const drive = createDriveClient(connection)

  const response = await drive.files.get(
    {
      fileId,
      alt: 'media',
    },
    {
      responseType: 'stream',
    }
  )

  return response.data
}

export const uploadBlogImageToDrive = async (connection, file) => {
  if (!file?.buffer) {
    throw new Error('Image file is required')
  }

  const drive = createDriveClient(connection)

  const rootFolderId =
    connection.rootFolderId ||
    await getOrCreateFolder(drive, 'Once Morre')

  const websiteFolderId = await getFolderId(
    drive,
    'Website',
    rootFolderId
  )

  if (!websiteFolderId) {
    throw new Error('Website folder not found in Google Drive')
  }

  const imagesFolderId = await getFolderId(
    drive,
    'Images',
    websiteFolderId
  )

  if (!imagesFolderId) {
    throw new Error('Images folder not found in Google Drive')
  }

  const blogsFolderId = await getOrCreateFolder(
    drive,
    'Blogs',
    imagesFolderId
  )

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      parents: [blogsFolderId],
    },
    media: {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer),
    },
    fields: 'id,name,mimeType,size,webViewLink,webContentLink',
  })

  const fileId = response.data.id

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  return {
    fileId,
    fileName: response.data.name,
    mimeType: response.data.mimeType,
    size: response.data.size,
    url: `https://drive.google.com/uc?export=view&id=${fileId}`,
    webViewLink: response.data.webViewLink || null,
  }
}

export const deleteDriveFile = async (connection, fileId) => {
  if (!fileId) return

  const drive = createDriveClient(connection)

  await drive.files.delete({
    fileId,
  })
}
