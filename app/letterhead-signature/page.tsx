"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Home,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LetterheadEditor } from "@/components/letterhead/letterhead-editor";
import { SignatureEditor } from "@/components/signature/signature-editor";
import { FeatureToggle } from "@/components/feature-toggle/feature-toggle";
import { DocumentPreview } from "@/components/document-preview/document-preview";
import {
  LetterheadConfig,
  SignatureConfig,
  DEFAULT_LETTERHEAD_CONFIG,
} from "@/types/letterhead";
import { DocumentFile } from "@/types/document";

export default function LetterheadSignaturePage() {
  const router = useRouter();
  const [letterheadEnabled, setLetterheadEnabled] = useState(true);
  const [signatureEnabled, setSignatureEnabled] = useState(true);
  const [document, setDocument] = useState<DocumentFile | null>(null);

  const [letterheadConfig, setLetterheadConfig] = useState<LetterheadConfig>({
    ...DEFAULT_LETTERHEAD_CONFIG,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [signatureConfig, setSignatureConfig] = useState<SignatureConfig>({
    id: crypto.randomUUID(),
    name: "",
    title: "",
    style: "typed",
    color: "#4facfe",
    fontSize: 18,
    fontFamily: "Roboto",
    position: "left",
    coordinates: { x: 20, y: 400 },
    backgroundRemoval: false,
    createdAt: new Date(),
  });

  // Load document from session storage on mount
  useEffect(() => {
    const documentData = sessionStorage.getItem("selectedDocument");
    if (documentData) {
      try {
        const parsedDocument = JSON.parse(documentData);
        console.log(
          "Loading document:",
          parsedDocument.name,
          "Type:",
          parsedDocument.type
        );

        // Recreate file from base64 content
        if (parsedDocument.fileContent) {
          const file = base64ToFile(
            parsedDocument.fileContent,
            parsedDocument.name,
            parsedDocument.type
          );

          console.log(
            "Recreated file size:",
            file.size,
            "Original size:",
            parsedDocument.size
          );

          const documentFile: DocumentFile = {
            id: parsedDocument.id,
            name: parsedDocument.name,
            size: file.size, // Use the actual recreated file size
            type: parsedDocument.type,
            file: file,
            uploadedAt: new Date(parsedDocument.uploadedAt),
            preview: parsedDocument.preview,
          };

          setDocument(documentFile);
        } else {
          console.error("No file content found in stored document");
          router.push("/document-processor");
        }
      } catch (error) {
        console.error("Error loading document:", error);
        router.push("/document-processor");
      }
    } else {
      router.push("/document-processor");
    }
  }, [router]);

  // Helper function to convert base64 to file
  const base64ToFile = (
    base64: string,
    filename: string,
    mimeType: string
  ): File => {
    try {
      // Handle data URL format (data:mime;base64,content)
      const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

      // Decode base64 to binary
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], filename, {
        type: mimeType,
        lastModified: Date.now(),
      });

      console.log("Base64 to File conversion:", {
        originalBase64Length: base64Data.length,
        byteArrayLength: byteArray.length,
        fileSize: file.size,
        fileName: filename,
        mimeType: mimeType,
      });

      return file;
    } catch (error) {
      console.error("Error converting base64 to file:", error);
      // Return empty file as fallback
      return new File([], filename, { type: mimeType });
    }
  };

  const handleSignaturePositionChange = (coordinates: {
    x: number;
    y: number;
  }) => {
    setSignatureConfig((prev) => ({
      ...prev,
      coordinates,
    }));
  };

  const handleProcessDocument = () => {
    try {
      // Store configurations in session storage based on what's enabled
      if (letterheadEnabled && letterheadConfig.companyName.trim()) {
        sessionStorage.setItem(
          "letterheadConfig",
          JSON.stringify(letterheadConfig)
        );
        console.log("Stored letterhead config:", letterheadConfig);
      } else {
        sessionStorage.removeItem("letterheadConfig");
        console.log("Removed letterhead config from storage");
      }

      if (signatureEnabled && signatureConfig.name.trim()) {
        sessionStorage.setItem(
          "signatureConfig",
          JSON.stringify(signatureConfig)
        );
        console.log("Stored signature config:", signatureConfig);
      } else {
        sessionStorage.removeItem("signatureConfig");
        console.log("Removed signature config from storage");
      }

      // Verify we have at least one feature enabled with valid data
      const hasValidLetterhead =
        letterheadEnabled && letterheadConfig.companyName.trim();
      const hasValidSignature = signatureEnabled && signatureConfig.name.trim();

      if (!hasValidLetterhead && !hasValidSignature) {
        console.error("No valid features to process");
        return;
      }

      console.log("Navigating to process-document page");
      // Navigate to processing page
      router.push("/process-document");
    } catch (error) {
      console.error("Error storing configurations:", error);
    }
  };

  const isProcessButtonDisabled = () => {
    if (!letterheadEnabled && !signatureEnabled) return true;

    if (letterheadEnabled && !letterheadConfig.companyName.trim()) return true;
    if (signatureEnabled && !signatureConfig.name.trim()) return true;

    return false;
  };

  const getProcessButtonText = () => {
    if (!letterheadEnabled && !signatureEnabled)
      return "Select at least one feature";

    const features = [];
    if (letterheadEnabled && letterheadConfig.companyName.trim())
      features.push("Letterhead");
    if (signatureEnabled && signatureConfig.name.trim())
      features.push("Signature");

    if (features.length === 0) return "Complete required fields";

    return `Continue with ${features.join(" & ")}`;
  };

  // Show loading state while document is being loaded
  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/document-processor"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Document Upload
          </Link>

          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Link>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Letterhead & Signature</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Customize your professional letterhead and create your digital
            signature. Choose the features you need for your document.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="text-sm font-medium text-primary">
                Upload Document
              </span>
            </div>

            <div className="flex-1 h-px bg-primary"></div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium text-primary">
                Customize Features
              </span>
            </div>

            <div className="flex-1 h-px bg-secondary"></div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-secondary/20 text-muted-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm text-muted-foreground">Download</span>
            </div>
          </div>
        </div>

        {/* Feature Toggle */}
        <FeatureToggle
          letterheadEnabled={letterheadEnabled}
          signatureEnabled={signatureEnabled}
          onLetterheadToggle={(enabled) => {
            setLetterheadEnabled(enabled);
            if (!enabled) {
              console.log("Letterhead disabled");
            }
          }}
          onSignatureToggle={(enabled) => {
            setSignatureEnabled(enabled);
            if (!enabled) {
              console.log("Signature disabled");
            }
          }}
        />

        {/* Main Content */}
        <div className="space-y-8 mb-12">
          {(letterheadEnabled || signatureEnabled) && (
            <>
              {/* Configuration Section */}
              <div
                className={`grid gap-8 ${
                  letterheadEnabled && signatureEnabled
                    ? "lg:grid-cols-2"
                    : "lg:grid-cols-1 max-w-4xl mx-auto"
                }`}
              >
                {letterheadEnabled && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <h2 className="text-lg font-medium text-foreground">
                        Letterhead Configuration
                      </h2>
                      {letterheadConfig.companyName.trim() && (
                        <div className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          Ready
                        </div>
                      )}
                    </div>
                    <LetterheadEditor
                      config={letterheadConfig}
                      onConfigChange={(config) => {
                        setLetterheadConfig(config);
                        console.log(
                          "Letterhead config updated:",
                          config.companyName
                        );
                      }}
                    />
                  </div>
                )}

                {signatureEnabled && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <h2 className="text-lg font-medium text-foreground">
                        Signature Configuration
                      </h2>
                      {signatureConfig.name.trim() && (
                        <div className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          Ready
                        </div>
                      )}
                    </div>
                    <SignatureEditor
                      config={signatureConfig}
                      onConfigChange={(config) => {
                        setSignatureConfig(config);
                        console.log("Signature config updated:", config.name);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Preview Section */}
              <div className="mt-12">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <h2 className="text-lg font-medium text-foreground">
                    Document Preview
                  </h2>
                </div>
                <DocumentPreview
                  document={document}
                  letterhead={letterheadEnabled ? letterheadConfig : undefined}
                  signature={signatureEnabled ? signatureConfig : undefined}
                  onSignaturePositionChange={handleSignaturePositionChange}
                />
              </div>
            </>
          )}

          {!letterheadEnabled && !signatureEnabled && (
            <div className="text-center py-16">
              <AlertCircle className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Features Selected
              </h3>
              <p className="text-muted-foreground">
                Please enable at least one feature above to customize your
                document.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              className="min-w-[160px]"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleProcessDocument}
              size="lg"
              className="docr-button-primary min-w-[240px]"
              disabled={isProcessButtonDisabled()}
            >
              {getProcessButtonText()}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Validation Messages */}
          <div className="space-y-2">
            {letterheadEnabled && !letterheadConfig.companyName.trim() && (
              <div className="flex items-center space-x-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Company name is required for letterhead</span>
              </div>
            )}

            {signatureEnabled && !signatureConfig.name.trim() && (
              <div className="flex items-center space-x-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Full name is required for signature</span>
              </div>
            )}

            {!letterheadEnabled && !signatureEnabled && (
              <div className="flex items-center space-x-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Please enable at least one feature to continue</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
