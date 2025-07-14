import { DocumentFile } from "./document";
import { LetterheadConfig, SignatureConfig } from "./letterhead";

export interface ProcessingConfig {
  document: DocumentFile;
  letterhead?: LetterheadConfig;
  signature?: SignatureConfig;
  outputFormat: "pdf" | "png" | "jpg";
  quality: "low" | "medium" | "high";
}

export interface ProcessedDocument {
  id: string;
  originalDocument: DocumentFile;
  processedUrl: string;
  downloadUrl: string;
  filename: string;
  fileSize: number;
  format: string;
  processedAt: Date;
  config: ProcessingConfig;
}

export interface ProcessingProgress {
  stage: "preparing" | "rendering" | "generating" | "complete" | "error";
  progress: number;
  message: string;
  error?: string;
}

export interface DocumentDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}
