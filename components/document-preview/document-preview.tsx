"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DocumentFile } from "@/types/document";
import { LetterheadConfig, SignatureConfig } from "@/types/letterhead";
import { Eye, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraggableSignature } from "@/components/signature/draggable-signature";
import { cn } from "@/lib/utils";

interface DocumentPreviewProps {
  document: DocumentFile;
  letterhead?: LetterheadConfig;
  signature?: SignatureConfig;
  onSignaturePositionChange?: (coordinates: { x: number; y: number }) => void;
  className?: string;
}

export function DocumentPreview({
  document,
  letterhead,
  signature,
  onSignaturePositionChange,
  className,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragMode, setIsDragMode] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate preview URL for the document
    if (document.file && document.file.size > 0) {
      try {
        const url = URL.createObjectURL(document.file);
        setPreviewUrl(url);
        console.log(
          "Created preview URL for:",
          document.name,
          "Size:",
          document.file.size
        );

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error creating preview URL:", error);
        // Fallback to stored preview if available
        if (document.preview) {
          setPreviewUrl(document.preview);
        }
      }
    } else if (document.preview) {
      // Use the stored preview as fallback
      setPreviewUrl(document.preview);
      console.log("Using stored preview for:", document.name);
    }
  }, [document]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("image")) return "🖼️";
    return "📄";
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setZoom(1);

  const handleSignaturePositionChange = (coordinates: {
    x: number;
    y: number;
  }) => {
    console.log("Signature position changed:", coordinates);
    if (onSignaturePositionChange) {
      onSignaturePositionChange(coordinates);
    }
  };

  return (
    <Card className={cn("docr-card", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg font-medium">
                Document Preview
              </CardTitle>
              <CardDescription>
                Preview and position elements on your document
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {signature && (
              <Button
                variant={isDragMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsDragMode(!isDragMode)}
                className={cn(
                  "transition-all",
                  isDragMode && "bg-primary text-primary-foreground"
                )}
              >
                <Move className="h-4 w-4 mr-1" />
                Position
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={zoom >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px]">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isDragMode && signature && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-2 text-primary text-sm">
              <Move className="h-4 w-4" />
              <span>
                <strong>Drag Mode Active:</strong> Click and drag the signature
                to position it on your document. Use the reset button to return
                to default position.
              </span>
            </div>
          </div>
        )}

        <div
          ref={previewRef}
          className="bg-secondary/10 rounded-lg p-4 overflow-auto max-h-[600px] relative"
        >
          <div
            ref={documentRef}
            className="bg-white mx-auto shadow-lg relative"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              width: "210mm",
              minHeight: "297mm",
              padding: "20mm",
              color: "black",
              fontFamily: letterhead?.fonts.family || "Arial, sans-serif",
              position: "relative",
            }}
          >
            {/* Letterhead Section */}
            {letterhead && letterhead.companyName && (
              <div
                className="flex items-center justify-between mb-8 pb-5 border-b-2"
                style={{ borderBottomColor: letterhead.colors.primary }}
              >
                {/* Logo */}
                {letterhead.logo && (
                  <div className="flex-shrink-0 mr-5">
                    <img
                      src={letterhead.logo.url}
                      alt="Company Logo"
                      className="max-w-[120px] max-h-[80px] object-contain"
                    />
                  </div>
                )}

                {/* Company Info */}
                <div
                  className={cn(
                    "flex-1",
                    letterhead.logo?.position === "right"
                      ? "text-left"
                      : "text-right"
                  )}
                >
                  <h1
                    className="font-bold mb-2"
                    style={{
                      fontSize: letterhead.fonts.size.company,
                      fontWeight: letterhead.fonts.weight.company,
                      color: letterhead.colors.primary,
                      margin: "0 0 10px 0",
                    }}
                  >
                    {letterhead.companyName}
                  </h1>

                  <div
                    className="whitespace-pre-line mb-1"
                    style={{
                      fontSize: letterhead.fonts.size.address,
                      fontWeight: letterhead.fonts.weight.address,
                      color: letterhead.colors.text,
                      margin: "5px 0",
                    }}
                  >
                    {letterhead.companyAddress}
                  </div>

                  {(letterhead.companyPhone ||
                    letterhead.companyEmail ||
                    letterhead.companyWebsite) && (
                    <div
                      style={{
                        fontSize: letterhead.fonts.size.contact,
                        fontWeight: letterhead.fonts.weight.contact,
                        color: letterhead.colors.text,
                        margin: "5px 0",
                      }}
                    >
                      {[
                        letterhead.companyPhone,
                        letterhead.companyEmail,
                        letterhead.companyWebsite,
                      ]
                        .filter(Boolean)
                        .join(" | ")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Content */}
            <div className="my-10 min-h-[400px] leading-relaxed">
              {document.type.includes("image") && previewUrl ? (
                <div className="text-center">
                  <img
                    src={previewUrl}
                    alt="Document content"
                    className="max-w-full h-auto block mx-auto rounded-lg shadow-sm"
                    onLoad={() => console.log("Image loaded successfully")}
                    onError={(e) => {
                      console.error("Failed to load image:", e);
                      // Try to use base64 data directly if object URL fails
                      if (document.file && !previewUrl.startsWith("data:")) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setPreviewUrl(event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(document.file);
                      }
                    }}
                  />
                </div>
              ) : document.type.includes("pdf") ? (
                <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-6xl mb-6 text-red-500">📄</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    PDF Document
                  </h3>
                  <p className="text-gray-600 mb-1">{document.name}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {formatFileSize(document.size)}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-blue-700">
                      PDF content will be preserved and included in the final
                      processed document
                    </p>
                  </div>
                </div>
              ) : document.type.includes("word") ||
                document.type.includes("document") ? (
                <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-6xl mb-6 text-blue-600">📝</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Word Document
                  </h3>
                  <p className="text-gray-600 mb-1">{document.name}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {formatFileSize(document.size)}
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-green-700">
                      Document content will be preserved and included in the
                      final processed document
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-6xl mb-6 text-gray-500">
                    {getFileIcon(document.type)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Original Document
                  </h3>
                  <p className="text-gray-600 mb-1">{document.name}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {formatFileSize(document.size)}
                  </p>
                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-gray-600">
                      File type: {document.type}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Content will be preserved in the final document
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Draggable Signature or Fixed Signature */}
            {signature && signature.name && (
              <>
                {isDragMode ? (
                  <DraggableSignature
                    signature={signature}
                    onPositionChange={handleSignaturePositionChange}
                    containerRef={documentRef}
                    scale={zoom}
                  />
                ) : (
                  <div
                    className="mt-16"
                    style={{
                      textAlign: signature.position,
                      ...(signature.coordinates && {
                        position: "absolute",
                        left: `${signature.coordinates.x}px`,
                        top: `${signature.coordinates.y}px`,
                      }),
                    }}
                  >
                    <div className="inline-block min-w-[200px]">
                      {signature.style === "image" && signature.image ? (
                        <img
                          src={
                            signature.image.processedUrl || signature.image.url
                          }
                          alt="Signature"
                          className="max-w-[200px] max-h-[80px] object-contain block mb-2"
                        />
                      ) : (
                        <div
                          className="mb-2"
                          style={{
                            fontSize: signature.fontSize,
                            color: signature.color,
                            fontFamily:
                              signature.style === "handwritten"
                                ? "cursive"
                                : signature.fontFamily,
                          }}
                        >
                          {signature.name}
                        </div>
                      )}

                      {signature.title && (
                        <div
                          className="text-sm text-gray-600 border-t border-gray-300 pt-1 mt-1"
                          style={{ fontSize: "12px" }}
                        >
                          {signature.title}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
