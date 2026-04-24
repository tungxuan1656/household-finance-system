const readImageDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'))
    }

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Failed to read image preview.'))

        return
      }

      resolve(reader.result)
    }

    reader.readAsDataURL(file)
  })

const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onerror = () => {
      reject(new Error('Failed to load image.'))
    }

    image.onload = () => {
      resolve(image)
    }

    image.src = src
  })

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate avatar file.'))

          return
        }

        resolve(blob)
      },
      'image/jpeg',
      quality,
    )
  })

const createSquareCanvas = (size: number) => {
  const canvas = document.createElement('canvas')

  canvas.width = size
  canvas.height = size

  return canvas
}

export const prepareSquareAvatarImage = async (input: {
  file: File
  outputSize?: number
  quality?: number
}) => {
  const outputSize = input.outputSize ?? 512
  const quality = input.quality ?? 0.82
  const imageDataUrl = await readImageDataUrl(input.file)
  const image = await loadImageElement(imageDataUrl)

  const squareSize = Math.min(image.width, image.height)
  const sourceX = Math.floor((image.width - squareSize) / 2)
  const sourceY = Math.floor((image.height - squareSize) / 2)
  const canvas = createSquareCanvas(outputSize)
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Failed to initialize image processing canvas.')
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    squareSize,
    squareSize,
    0,
    0,
    outputSize,
    outputSize,
  )

  const blob = await canvasToBlob(canvas, quality)

  return {
    blob,
    previewDataUrl: canvas.toDataURL('image/jpeg', quality),
  }
}

export const isAvatarImageFile = (file: File) => file.type.startsWith('image/')
