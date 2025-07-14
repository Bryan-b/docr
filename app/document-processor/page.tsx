"use client";

import { useState } from "react";
import { DocumentUpload } from "@/components/document-upload/document-upload";
import { DocumentFile } from "@/types/document";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DocumentProcessor() {
  const router = useRouter();
  const [selectedDocument, setSelectedDocument] = useState<DocumentFile | null>(
    null
  );

  const handleDocumentSelect = (document: DocumentFile) => {
    setSelectedDocument(document);
  };

  const handleContinue = async () => {
    if (selectedDocument) {
      try {
        // Convert file to base64 for storage
        const fileContent = await fileToBase64(selectedDocument.file);

        // Store document with file content
        const documentToStore = {
          ...selectedDocument,
          fileContent, // Store as base64
          file: undefined, // Remove file object for JSON serialization
        };

        sessionStorage.setItem(
          "selectedDocument",
          JSON.stringify(documentToStore)
        );
        router.push("/letterhead-signature");
      } catch (error) {
        console.error("Error storing document:", error);
      }
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Document Processor</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your document to add professional letterhead and signature.
            We support PDF, Word documents, and image files.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  selectedDocument
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {selectedDocument ? <CheckCircle className="h-4 w-4" /> : "1"}
              </div>
              <span
                className={`text-sm font-medium ${
                  selectedDocument ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Upload Document
              </span>
            </div>

            <div className="flex-1 h-px bg-secondary"></div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-secondary/20 text-muted-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm text-muted-foreground">
                Add Letterhead
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

        {/* Upload Section */}
        <div className="space-y-8">
          <DocumentUpload
            onDocumentSelect={handleDocumentSelect}
            acceptedDocument={selectedDocument ?? undefined}
          />

          {selectedDocument && (
            <div className="flex justify-center">
              <Button
                onClick={handleContinue}
                size="lg"
                className="docr-button-primary min-w-[280px] h-12 text-base font-medium"
              >
                Continue to Letterhead & Signature
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <h3 className="text-lg font-medium mb-4">Need Help?</h3>
          <p className="text-muted-foreground text-sm">
            Supported formats: PDF (.pdf), Word (.doc, .docx), Images (.jpg,
            .png, .gif)
            <br />
            Maximum file size: 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
