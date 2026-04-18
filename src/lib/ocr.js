import { createWorker } from 'tesseract.js'

let worker = null

async function getWorker() {
  if (!worker) {
    worker = await createWorker('eng')
  }
  return worker
}

export async function extractText(imageFile) {
  try {
    const w = await getWorker()
    
    // Create object URL for the image
    let imageUrl
    if (imageFile instanceof File || imageFile instanceof Blob) {
      imageUrl = URL.createObjectURL(imageFile)
    } else {
      imageUrl = imageFile // Assume it's already a URL
    }

    const { data: { text, confidence } } = await w.recognize(imageUrl)

    // Clean up URL
    if (imageFile instanceof File || imageFile instanceof Blob) {
      URL.revokeObjectURL(imageUrl)
    }

    return {
      text: text.trim(),
      confidence: Math.round(confidence),
      success: true
    }
  } catch (error) {
    console.error('OCR Error:', error)
    return {
      text: '',
      confidence: 0,
      success: false,
      error: error.message
    }
  }
}

export async function terminateOCR() {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}
