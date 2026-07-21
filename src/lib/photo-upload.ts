async function uploadMemberMedia(kind: 'photo' | 'video', file: File): Promise<string> {
  const formData = new FormData()
  formData.append('kind', kind)
  formData.append('file', file)

  const response = await fetch('/api/member/media/upload', {
    method: 'POST',
    body: formData,
  })

  const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null

  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error || `${kind} upload failed.`)
  }

  return payload.url
}

export async function uploadProfilePhotos(_userId: string, files: FileList): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (const file of Array.from(files)) {
    uploadedUrls.push(await uploadMemberMedia('photo', file))
  }

  return uploadedUrls
}

export async function uploadProfileVideos(_userId: string, files: FileList): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (const file of Array.from(files)) {
    uploadedUrls.push(await uploadMemberMedia('video', file))
  }

  return uploadedUrls
}
