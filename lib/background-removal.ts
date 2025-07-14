import { removeBackground } from "@imgly/background-removal";

export interface BackgroundRemovalOptions {
  quality?: "low" | "medium" | "high";
  outputFormat?: "image/png" | "image/webp";
}

export async function removeImageBackground(
  imageFile: File,
  options: BackgroundRemovalOptions = {}
): Promise<{ processedBlob: Blob; processedUrl: string }> {
  try {
    const { quality = "medium", outputFormat = "image/png" } = options;

    // Configure background removal
    const config = {
      publicPath: "/models/", // Path to the ML models
      debug: false,
      fetchArgs: {
        mode: "cors" as RequestMode,
      },
      model: "isnet" as "isnet", // or "isnet_fp16" or "isnet_quint8" for different quality/speed tradeoffs
    };

    // Remove background
    const processedBlob = await removeBackground(imageFile, config);

    // Create URL for the processed image
    const processedUrl = URL.createObjectURL(processedBlob);

    return {
      processedBlob,
      processedUrl,
    };
  } catch (error) {
    console.error("Background removal failed:", error);
    throw new Error("Failed to remove background from image");
  }
}

export function isBackgroundRemovalSupported(): boolean {
  // Check if the browser supports the required features
  return (
    typeof window !== "undefined" &&
    "OffscreenCanvas" in window &&
    "ImageBitmap" in window
  );
}

// Create a processed file from the blob
export function createProcessedFile(blob: Blob, originalFile: File): File {
  return new File([blob], `processed_${originalFile.name}`, {
    type: "image/png",
    lastModified: Date.now(),
  });
}
