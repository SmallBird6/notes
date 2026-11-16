const IMAGE_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

type ClipboardLike = {
  items?: ArrayLike<{ kind: string; type: string; getAsFile?: () => File | null }>
  files?: ArrayLike<File>
}

export function imageExtension(mime: string): string | null {
  return IMAGE_EXT[mime.toLowerCase()] ?? null
}

export function clipboardImageFiles(data: ClipboardLike | null): File[] {
  if (!data) return []
  const files: File[] = []
  const items = data.items ? Array.from(data.items) : []
  for (const item of items) {
    if (item.kind !== 'file' || !imageExtension(item.type)) continue
    const file = item.getAsFile?.()
    if (file) files.push(file)
  }
  if (files.length > 0) return files
  return Array.from(data.files ?? []).filter((file) => imageExtension(file.type))
}

export function pastedImageStamp(date: Date): string {
  const pad = (value: number, width = 2) => String(value).padStart(width, '0')
  return [
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}${pad(date.getMilliseconds(), 3)}`,
  ].join('-')
}

export function pastedImageName(mime: string, date: Date, taken: ReadonlySet<string>): string | null {
  const ext = imageExtension(mime)
  if (!ext) return null
  const stamp = pastedImageStamp(date)
  let name = `${stamp}.${ext}`
  let suffix = 2
  while (taken.has(name)) {
    name = `${stamp}-${suffix}.${ext}`
    suffix += 1
  }
  return name
}
