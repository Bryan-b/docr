"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, AlertCircle, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DocumentFile,
  SUPPORTED_DOCUMENT_TYPES,
  MAX_FILE_SIZE,
} from "@/types/document";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  onDocumentSelect: (document: DocumentFile) => void;
  acceptedDocument?: DocumentFile;
}

export function DocumentUpload({
  onDocumentSelect,
  acceptedDocument,
}: DocumentUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError("File size must be less than 10MB");
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Please upload a PDF, Word document, or image file");
        } else {
          setError("Invalid file. Please try again.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Create preview URL for images
        let preview = undefined;
        if (file.type.includes("image")) {
          preview = URL.createObjectURL(file);
        }

        const documentFile: DocumentFile = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          preview,
          uploadedAt: new Date(),
        };
        onDocumentSelect(documentFile);
      }
    },
    [onDocumentSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeDocument = () => {
    setError(null);
    // Clear the selected document by calling with a null-like value
    // You might want to adjust this based on your app's state management
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("image")) return "🖼️";
    return "📄";
  };

  return (
    <Card className="docr-card w-full max-w-4xl mx-auto relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg pointer-events-none" />
      <CardHeader className="pb-6 relative z-10">
        <CardTitle className="text-2xl font-medium text-foreground">
          Upload Document
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base">
          Select a document to add letterhead and signature. We support PDF,
          Word documents, and image files in the darkness.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        {!acceptedDocument ? (
          <div
            {...getRootProps()}
            className={cn(
              "docr-upload-zone rounded-xl p-16 text-center cursor-pointer relative overflow-hidden",
              isDragActive && "active",
              error && "border-destructive/60"
            )}
          >
            <input {...getInputProps()} />
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

            <div className="flex flex-col items-center space-y-6 relative z-10">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20 group-hover:scale-110 transition-transform">
                <Upload className="h-10 w-10 text-primary drop-shadow-lg" />
              </div>
              <div className="space-y-3">
                <p className="text-xl font-medium text-foreground">
                  {isDragActive
                    ? "Drop your document into the darkness"
                    : "Drag & drop your document here"}
                </p>
                <p className="text-muted-foreground">
                  or click to browse files from the shadows
                </p>
              </div>
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="docr-feature-dot"></div>
                  <span>PDF, DOC, DOCX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="docr-feature-dot"></div>
                  <span>JPG, PNG, GIF</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="docr-feature-dot"></div>
                  <span>Max 10MB</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="docr-gradient-border rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20">
                  <span className="text-2xl drop-shadow-lg">
                    {getFileIcon(acceptedDocument.type)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="font-semibold text-foreground text-lg">
                      {acceptedDocument.name}
                    </p>
                    <CheckCircle className="h-5 w-5 text-primary drop-shadow-lg" />
                  </div>
                  <p className="text-muted-foreground">
                    {formatFileSize(acceptedDocument.size)} •{" "}
                    <span className="text-primary">Uploaded successfully</span>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeDocument}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center space-x-3 text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
