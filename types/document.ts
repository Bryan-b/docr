export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
  uploadedAt: Date;
}

export interface DocumentUploadError {
  message: string;
  code: string;
}

export const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/gif",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
