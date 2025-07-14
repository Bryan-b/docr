"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DocumentPreview } from "@/components/document-preview/document-preview";
import {
  ArrowLeft,
  Download,
  Home,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { DocumentFile } from "@/types/document";
import { LetterheadConfig, SignatureConfig } from "@/types/letterhead";
import {
  ProcessingConfig,
  ProcessedDocument,
  ProcessingProgress,
} from "@/types/processing";
import { DocumentProcessor } from "@/lib/document-processor";

export default function ProcessDocumentPage() {
  const router = useRouter();
  const [document, setDocument] = useState<DocumentFile | null>(null);
  const [letterhead, setLetterhead] = useState<LetterheadConfig | null>(null);
  const [signature, setSignature] = useState<SignatureConfig | null>(null);
  const [outputFormat, setOutputFormat] = useState<"pdf" | "png" | "jpg">(
    "pdf"
  );
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [processedDocument, setProcessedDocument] =
    useState<ProcessedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        console.log("Loading configurations from session storage...");

        const documentData = sessionStorage.getItem("selectedDocument");
        const letterheadData = sessionStorage.getItem("letterheadConfig");
        const signatureData = sessionStorage.getItem("signatureConfig");

        console.log("Document data:", documentData ? "Found" : "Not found");
        console.log("Letterhead data:", letterheadData ? "Found" : "Not found");
        console.log("Signature data:", signatureData ? "Found" : "Not found");

        // Load document
        if (documentData) {
          try {
            const parsedDocument = JSON.parse(documentData);
            console.log("Parsed document:", parsedDocument.name);

            // Recreate file from base64 content
            if (parsedDocument.fileContent) {
              const file = base64ToFile(
                parsedDocument.fileContent,
                parsedDocument.name,
                parsedDocument.type
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
              return;
            }
          } catch (error) {
            console.error("Error parsing document data:", error);
            router.push("/document-processor");
            return;
          }
        } else {
          console.log("No document found, redirecting to document processor");
          router.push("/document-processor");
          return;
        }

        // Load letterhead configuration
        if (letterheadData) {
          try {
            const parsedLetterhead = JSON.parse(letterheadData);
            console.log("Parsed letterhead:", parsedLetterhead.companyName);

            // Recreate the letterhead config with proper Date objects
            const letterheadConfig: LetterheadConfig = {
              ...parsedLetterhead,
              createdAt: new Date(parsedLetterhead.createdAt),
              updatedAt: new Date(parsedLetterhead.updatedAt),
              // Handle logo if it exists
              logo: parsedLetterhead.logo
                ? {
                    ...parsedLetterhead.logo,
                    file: null as any, // We'll handle the logo file separately
                  }
                : undefined,
            };

            setLetterhead(letterheadConfig);
          } catch (error) {
            console.error("Error parsing letterhead data:", error);
          }
        }

        // Load signature configuration
        if (signatureData) {
          try {
            const parsedSignature = JSON.parse(signatureData);
            console.log("Parsed signature:", parsedSignature.name);

            // Recreate the signature config with proper Date object
            const signatureConfig: SignatureConfig = {
              ...parsedSignature,
              createdAt: new Date(parsedSignature.createdAt),
              // Handle signature image if it exists
              image: parsedSignature.image
                ? {
                    ...parsedSignature.image,
                    file: null as any, // We'll handle the image file separately
                  }
                : undefined,
            };

            setSignature(signatureConfig);
          } catch (error) {
            console.error("Error parsing signature data:", error);
          }
        }

        // Validate that we have at least one feature
        const hasValidLetterhead =
          letterheadData && JSON.parse(letterheadData).companyName?.trim();
        const hasValidSignature =
          signatureData && JSON.parse(signatureData).name?.trim();

        if (!hasValidLetterhead && !hasValidSignature) {
          console.log(
            "No valid features found, redirecting to letterhead-signature"
          );
          router.push("/letterhead-signature");
          return;
        }

        setIsLoading(false);
        console.log("Configurations loaded successfully");
      } catch (error) {
        console.error("Error loading configurations:", error);
        setError("Failed to load configurations");
        setIsLoading(false);
      }
    };

    loadConfigurations();
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

  const handleProcessDocument = async () => {
    if (!document) {
      setError("No document found");
      return;
    }

    console.log("Starting document processing...");
    console.log("Document:", document.name);
    console.log("File size:", document.file.size);
    console.log("Letterhead enabled:", !!letterhead);
    console.log("Signature enabled:", !!signature);

    setIsProcessing(true);
    setError(null);
    setProgress(null);

    try {
      const config: ProcessingConfig = {
        document: document, // Use the actual document with real file content
        letterhead: letterhead || undefined,
        signature: signature || undefined,
        outputFormat,
        quality,
      };

      console.log("Processing config:", {
        document: config.document.name,
        hasLetterhead: !!config.letterhead,
        hasSignature: !!config.signature,
        outputFormat: config.outputFormat,
        quality: config.quality,
      });

      const processor = new DocumentProcessor((progress) => {
        console.log("Processing progress:", progress);
        setProgress(progress);
      });

      const result = await processor.processDocument(config);
      console.log("Document processed successfully:", result.filename);
      setProcessedDocument(result);
    } catch (err) {
      console.error("Processing error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process document"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedDocument) {
      try {
        const link = window.document.createElement("a");
        link.href = processedDocument.downloadUrl;
        link.download = processedDocument.filename;
        link.style.display = "none";
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);

        console.log("Download initiated for:", processedDocument.filename);
      } catch (error) {
        console.error("Download failed:", error);
        setError("Failed to download document");
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading configurations...</p>
        </div>
      </div>
    );
  }

  // Error state - no document
  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-foreground mb-2">No document found</p>
          <p className="text-muted-foreground mb-4">
            Please upload a document first
          </p>
          <Link href="/document-processor">
            <Button>Upload Document</Button>
          </Link>
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
            href="/letterhead-signature"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customization
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
          <h1 className="text-4xl font-bold mb-4">Process Document</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Review your document and download the final result
          </p>

          {/* Active Features Summary */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {letterhead && letterhead.companyName && (
              <div className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                Letterhead: {letterhead.companyName}
              </div>
            )}
            {signature && signature.name && (
              <div className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                Signature: {signature.name}
              </div>
            )}
            {!letterhead && !signature && (
              <div className="px-3 py-1 bg-destructive/20 text-destructive text-sm rounded-full">
                No features configured
              </div>
            )}
          </div>
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
                ✓
              </div>
              <span className="text-sm font-medium text-primary">
                Customize Features
              </span>
            </div>

            <div className="flex-1 h-px bg-primary"></div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium text-primary">Download</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Preview */}
          <DocumentPreview
            document={document}
            letterhead={letterhead || undefined}
            signature={signature || undefined}
          />

          {/* Processing Options */}
          <div className="space-y-6">
            {/* Output Settings */}
            <Card className="docr-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg font-medium">
                      Output Settings
                    </CardTitle>
                    <CardDescription>
                      Configure your document output preferences
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["pdf", "png", "jpg"] as const).map((format) => (
                      <button
                        key={format}
                        onClick={() => setOutputFormat(format)}
                        disabled={isProcessing}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          outputFormat === format
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-secondary/40 hover:border-secondary/60"
                        } ${
                          isProcessing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quality
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "medium", "high"] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        disabled={isProcessing}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          quality === q
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-secondary/40 hover:border-secondary/60"
                        } ${
                          isProcessing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {q.charAt(0).toUpperCase() + q.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Status */}
            {(isProcessing || progress || processedDocument || error) && (
              <Card className="docr-card">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Processing Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isProcessing && progress && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm">{progress.message}</span>
                      </div>
                      <div className="w-full bg-secondary/20 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {processedDocument && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-primary">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">
                          Document processed successfully!
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Filename: {processedDocument.filename}</p>
                        <p>
                          Size: {formatFileSize(processedDocument.fileSize)}
                        </p>
                        <p>Format: {processedDocument.format.toUpperCase()}</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center space-x-3 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {!processedDocument ? (
                <Button
                  onClick={handleProcessDocument}
                  disabled={isProcessing || (!letterhead && !signature)}
                  size="lg"
                  className="docr-button-primary w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Process Document
                      <Settings className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleDownload}
                  size="lg"
                  className="docr-button-primary w-full"
                >
                  Download Document
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => router.push("/letterhead-signature")}
                disabled={isProcessing}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Customization
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
