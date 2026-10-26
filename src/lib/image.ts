import type { Photo } from './schema'

const MAX_INPUT_BYTES = 12 * 1024 * 1024
const MAX_EDGE = 900

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('That image could not be read.'))
    image.src = url
  })
}

export async function photoFromFile(file: File): Promise<Photo> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file (JPG, PNG or WebP).')
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('That image is larger than 12 MB. Choose a smaller file.')
  }
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height))
    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Your browser could not prepare that image.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)
    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      zoom: 1,
      x: 50,
      y: 50,
      shape: 'circle',
      grayscale: false,
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function readFileAsText(file: File): Promise<string> {
  return file.text()
}
