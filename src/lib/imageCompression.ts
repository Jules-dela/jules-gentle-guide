// Client-side image compression for admin uploads.
// Produces a small preview (fast display) and a compressed upload File.

export interface ProcessedImage {
  previewUrl: string;   // object URL of ~500px thumbnail (revoke when done)
  uploadFile: File;     // ~1600px JPEG ~0.82, ready for storage
  originalName: string;
}

const PREVIEW_MAX = 500;
const UPLOAD_MAX = 1600;
const UPLOAD_QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
      // don't revoke here — caller may still be drawing.
      // We revoke below after both canvases are done.
      (img as any).__srcUrl = url;
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function drawScaled(img: HTMLImageElement, maxEdge: number): HTMLCanvasElement {
  const { naturalWidth: w, naturalHeight: h } = img;
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2d context unavailable');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      type,
      quality,
    );
  });
}

export async function processImage(file: File): Promise<ProcessedImage> {
  // Non-image files bypass processing.
  if (!file.type.startsWith('image/')) {
    const previewUrl = URL.createObjectURL(file);
    return { previewUrl, uploadFile: file, originalName: file.name };
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    const previewUrl = URL.createObjectURL(file);
    return { previewUrl, uploadFile: file, originalName: file.name };
  }

  try {
    const previewCanvas = drawScaled(img, PREVIEW_MAX);
    const uploadCanvas = drawScaled(img, UPLOAD_MAX);

    const [previewBlob, uploadBlob] = await Promise.all([
      canvasToBlob(previewCanvas, 'image/jpeg', 0.7),
      canvasToBlob(uploadCanvas, 'image/jpeg', UPLOAD_QUALITY),
    ]);

    const previewUrl = URL.createObjectURL(previewBlob);
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const uploadFile = new File([uploadBlob], `${baseName}.jpg`, { type: 'image/jpeg' });

    return { previewUrl, uploadFile, originalName: file.name };
  } finally {
    const srcUrl = (img as any).__srcUrl as string | undefined;
    if (srcUrl) URL.revokeObjectURL(srcUrl);
  }
}

export async function processImages(
  files: File[] | FileList,
  concurrency = 3,
): Promise<ProcessedImage[]> {
  const arr = Array.from(files);
  const results: ProcessedImage[] = new Array(arr.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= arr.length) return;
      results[i] = await processImage(arr[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, arr.length) }, worker);
  await Promise.all(workers);
  return results;
}