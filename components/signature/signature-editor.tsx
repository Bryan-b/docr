"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Pen, Type, Image } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { SignatureConfig, SignatureImageConfig } from "@/types/letterhead";
import { cn } from "@/lib/utils";

interface SignatureEditorProps {
  config: SignatureConfig;
  onConfigChange: (config: SignatureConfig) => void;
}

export function SignatureEditor({
  config,
  onConfigChange,
}: SignatureEditorProps) {
  const [previewText, setPreviewText] = useState(config.name);

  const onImageDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const imageConfig: SignatureImageConfig = {
          file,
          url: URL.createObjectURL(file),
          width: 200,
          height: 80,
        };
        onConfigChange({
          ...config,
          image: imageConfig,
          style: "image",
        });
      }
    },
    [config, onConfigChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
  });

  const handleInputChange = (field: keyof SignatureConfig, value: any) => {
    onConfigChange({
      ...config,
      [field]: value,
    });
  };

  const signatureStyles = [
    { id: "handwritten", label: "Handwritten", icon: Pen },
    { id: "typed", label: "Typed", icon: Type },
    { id: "image", label: "Image", icon: Image },
  ];

  return (
    <Card className="docr-card w-full">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Digital Signature</CardTitle>
        <CardDescription>
          Create your digital signature for professional document signing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Signature Style Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Signature Style
          </label>
          <div className="grid grid-cols-3 gap-3">
            {signatureStyles.map((style) => {
              const Icon = style.icon;
              return (
                <button
                  key={style.id}
                  onClick={() => handleInputChange("style", style.id)}
                  className={cn(
                    "flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all",
                    config.style === style.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-secondary/40 hover:border-secondary/60"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{style.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => {
                handleInputChange("name", e.target.value);
                setPreviewText(e.target.value);
              }}
              className="w-full px-3 py-2 bg-secondary/10 border border-secondary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Job Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 bg-secondary/10 border border-secondary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter your job title"
            />
          </div>
        </div>

        {/* Style-specific Options */}
        {config.style === "image" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Signature Image
              </label>
              {!config.image ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "docr-upload-zone rounded-lg p-6 text-center cursor-pointer",
                    isDragActive && "active"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center space-y-3">
                    <Upload className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">Upload signature image</p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG, GIF up to 2MB
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={config.image.url}
                      alt="Signature"
                      className="h-12 w-auto object-contain rounded border border-secondary/40"
                    />
                    <div>
                      <p className="font-medium">Signature uploaded</p>
                      <p className="text-sm text-muted-foreground">
                        {config.image.width}x{config.image.height}px
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange("image", undefined)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {(config.style === "handwritten" || config.style === "typed") && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Font Size
              </label>
              <input
                type="range"
                min="12"
                max="36"
                value={config.fontSize}
                onChange={(e) =>
                  handleInputChange("fontSize", parseInt(e.target.value))
                }
                className="w-full"
              />
              <div className="text-sm text-muted-foreground mt-1">
                {config.fontSize}px
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={config.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="w-8 h-8 rounded border border-secondary/40 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="flex-1 px-2 py-1 bg-secondary/10 border border-secondary/40 rounded text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Position */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Signature Position
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["left", "center", "right"] as const).map((position) => (
              <button
                key={position}
                onClick={() => handleInputChange("position", position)}
                className={cn(
                  "p-2 rounded-lg border text-sm font-medium transition-all",
                  config.position === position
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-secondary/40 hover:border-secondary/60"
                )}
              >
                {position.charAt(0).toUpperCase() + position.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium mb-2">Preview</label>
          <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/40">
            <div
              className={cn(
                "text-center",
                config.position === "left" && "text-left",
                config.position === "right" && "text-right"
              )}
            >
              {config.style === "image" && config.image ? (
                <img
                  src={config.image.url}
                  alt="Signature Preview"
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <div
                  style={{
                    fontSize: config.fontSize,
                    color: config.color,
                    fontFamily:
                      config.style === "handwritten"
                        ? "cursive"
                        : config.fontFamily,
                  }}
                >
                  {previewText || "Your Name"}
                </div>
              )}
              {config.title && (
                <div className="text-sm text-muted-foreground mt-1">
                  {config.title}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
