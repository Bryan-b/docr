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
import { Upload, Image, Palette, Type, Layout } from "lucide-react";
import { useDropzone } from "react-dropzone";
import {
  LetterheadConfig,
  DEFAULT_LETTERHEAD_CONFIG,
  LogoConfig,
} from "@/types/letterhead";
import { cn } from "@/lib/utils";

interface LetterheadEditorProps {
  config: LetterheadConfig;
  onConfigChange: (config: LetterheadConfig) => void;
}

export function LetterheadEditor({
  config,
  onConfigChange,
}: LetterheadEditorProps) {
  const [activeTab, setActiveTab] = useState<
    "basic" | "logo" | "style" | "layout"
  >("basic");

  const onLogoDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const logoConfig: LogoConfig = {
          file,
          url: URL.createObjectURL(file),
          width: 200,
          height: 80,
          position: "left",
        };
        onConfigChange({
          ...config,
          logo: logoConfig,
          updatedAt: new Date(),
        });
      }
    },
    [config, onConfigChange]
  );

  const {
    getRootProps: getLogoRootProps,
    getInputProps: getLogoInputProps,
    isDragActive: isLogoDragActive,
  } = useDropzone({
    onDrop: onLogoDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const handleInputChange = (field: string, value: string) => {
    onConfigChange({
      ...config,
      [field]: value,
      updatedAt: new Date(),
    });
  };

  const handleColorChange = (
    colorType: keyof typeof config.colors,
    color: string
  ) => {
    onConfigChange({
      ...config,
      colors: {
        ...config.colors,
        [colorType]: color,
      },
      updatedAt: new Date(),
    });
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Type },
    { id: "logo", label: "Logo", icon: Image },
    { id: "style", label: "Style", icon: Palette },
    { id: "layout", label: "Layout", icon: Layout },
  ];

  return (
    <Card className="docr-card w-full">
      <CardHeader>
        <CardTitle className="text-xl font-medium">
          Customize Letterhead
        </CardTitle>
        <CardDescription>
          Configure your professional letterhead with company details, logo, and
          styling
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 p-1 bg-secondary/10 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={config.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-secondary/10 border border-secondary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Address
                </label>
                <textarea
                  value={config.companyAddress}
                  onChange={(e) =>
                    handleInputChange("companyAddress", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-secondary/10 border border-secondary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="Enter company address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={config.companyPhone || ""}
                    onChange={(e) =>
                      handleInputChange("companyPhone", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={config.companyEmail || ""}
                    onChange={(e) =>
                      handleInputChange("companyEmail", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={config.companyWebsite || ""}
                  onChange={(e) =>
                    handleInputChange("companyWebsite", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-secondary/10 border border-secondary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="Website URL"
                />
              </div>
            </div>
          )}

          {activeTab === "logo" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Logo
                </label>
                {!config.logo ? (
                  <div
                    {...getLogoRootProps()}
                    className={cn(
                      "docr-upload-zone rounded-lg p-8 text-center cursor-pointer",
                      isLogoDragActive && "active"
                    )}
                  >
                    <input {...getLogoInputProps()} />
                    <div className="flex flex-col items-center space-y-3">
                      <Upload className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">Upload your logo</p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG, GIF, SVG up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={config.logo.url}
                          alt="Company Logo"
                          className="h-12 w-12 object-contain rounded border border-secondary/40"
                        />
                        <div>
                          <p className="font-medium">Logo uploaded</p>
                          <p className="text-sm text-muted-foreground">
                            {config.logo.width}x{config.logo.height}px
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onConfigChange({
                            ...config,
                            logo: undefined,
                            updatedAt: new Date(),
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Logo Position
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["left", "center", "right"] as const).map(
                          (position) => (
                            <button
                              key={position}
                              onClick={() =>
                                onConfigChange({
                                  ...config,
                                  logo: { ...config.logo!, position },
                                  updatedAt: new Date(),
                                })
                              }
                              className={cn(
                                "p-2 rounded-lg border text-sm font-medium transition-all",
                                config.logo?.position === position
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-secondary/40 hover:border-secondary/60"
                              )}
                            >
                              {position.charAt(0).toUpperCase() +
                                position.slice(1)}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "style" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Color Scheme
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.colors.primary}
                        onChange={(e) =>
                          handleColorChange("primary", e.target.value)
                        }
                        className="w-8 h-8 rounded border border-secondary/40 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.colors.primary}
                        onChange={(e) =>
                          handleColorChange("primary", e.target.value)
                        }
                        className="flex-1 px-2 py-1 bg-secondary/10 border border-secondary/40 rounded text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.colors.secondary}
                        onChange={(e) =>
                          handleColorChange("secondary", e.target.value)
                        }
                        className="w-8 h-8 rounded border border-secondary/40 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.colors.secondary}
                        onChange={(e) =>
                          handleColorChange("secondary", e.target.value)
                        }
                        className="flex-1 px-2 py-1 bg-secondary/10 border border-secondary/40 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Font Family
                </label>
                <select
                  value={config.fonts.family}
                  onChange={(e) =>
                    onConfigChange({
                      ...config,
                      fonts: { ...config.fonts, family: e.target.value },
                      updatedAt: new Date(),
                    })
                  }
                  className="w-full px-3 py-2 bg-secondary/10 border border-secondary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Roboto">Roboto</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "layout" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Header Height
                </label>
                <input
                  type="range"
                  min="80"
                  max="200"
                  value={config.layout.headerHeight}
                  onChange={(e) =>
                    onConfigChange({
                      ...config,
                      layout: {
                        ...config.layout,
                        headerHeight: parseInt(e.target.value),
                      },
                      updatedAt: new Date(),
                    })
                  }
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {config.layout.headerHeight}px
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Margins
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <div key={side}>
                      <label className="block text-xs text-muted-foreground mb-1">
                        {side.charAt(0).toUpperCase() + side.slice(1)}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={config.layout.margin[side]}
                        onChange={(e) =>
                          onConfigChange({
                            ...config,
                            layout: {
                              ...config.layout,
                              margin: {
                                ...config.layout.margin,
                                [side]: parseInt(e.target.value),
                              },
                            },
                            updatedAt: new Date(),
                          })
                        }
                        className="w-full px-2 py-1 bg-secondary/10 border border-secondary/40 rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
