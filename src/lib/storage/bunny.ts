type UploadMediaKind = 'photo' | 'video'

export type BunnyUploadResult = {
  url: string
  path: string
  contentType: string
  size: number
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getFileExtension(fileName: string, contentType: string): string {
  const fromName = fileName.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) {
    return fromName
  }

  if (contentType === 'image/jpeg') return 'jpg'
  if (contentType === 'image/png') return 'png'
  if (contentType === 'image/webp') return 'webp'
  if (contentType === 'image/gif') return 'gif'
  if (contentType === 'video/mp4') return 'mp4'
  if (contentType === 'video/webm') return 'webm'
  if (contentType === 'video/quicktime') return 'mov'

  return 'bin'
}

function buildStorageHost(_region: string): string {
  // Bunny storage API endpoint is always storage.bunnycdn.com
  // Region is not used in the hostname; geo-routing is handled server-side
  return 'storage.bunnycdn.com'
}

export async function uploadToBunnyStorage(params: {
  file: File
  userId: string
  kind: UploadMediaKind
}): Promise<BunnyUploadResult> {
  const storageZone = getRequiredEnv('BUNNY_STORAGE_ZONE')
  const storageApiKey = getRequiredEnv('BUNNY_STORAGE_API_KEY')
  const cdnBaseUrl = getRequiredEnv('BUNNY_CDN_BASE_URL').replace(/\/$/, '')
  const storageRegion = (process.env.BUNNY_STORAGE_REGION || '').trim()

  const storageHost = buildStorageHost(storageRegion)
  const safeUserId = sanitizeSegment(params.userId)
  const ext = getFileExtension(params.file.name, params.file.type)
  const timestamp = Date.now()
  const nonce = Math.random().toString(36).slice(2, 10)
  const path = `${params.kind}s/${safeUserId}/${timestamp}-${nonce}.${ext}`
  const uploadUrl = `https://${storageHost}/${storageZone}/${path}`

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      AccessKey: storageApiKey,
      'Content-Type': params.file.type || 'application/octet-stream',
    },
    body: Buffer.from(await params.file.arrayBuffer()),
  })

  if (!uploadResponse.ok) {
    const details = await uploadResponse.text().catch(() => '')
    throw new Error(
      `Bunny upload failed (${uploadResponse.status}): ${details || uploadResponse.statusText}`
    )
  }

  return {
    url: `${cdnBaseUrl}/${path}`,
    path,
    contentType: params.file.type || 'application/octet-stream',
    size: params.file.size,
  }
}
