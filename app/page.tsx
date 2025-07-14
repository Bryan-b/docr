import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Edit, Download, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-8 backdrop-blur-sm border border-primary/20">
              <FileText className="h-12 w-12 text-primary drop-shadow-lg" />
            </div>
            <h1 className="text-6xl font-bold mb-8 text-foreground">
              Welcome to{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Docr
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              Transform your documents with professional letterhead and
              signature.
              <br />
              <span className="text-primary/80">
                Fast, secure, and effortless
              </span>{" "}
              document processing in the dark.
            </p>
          </div>

          <Link href="/document-processor">
            <Button
              size="lg"
              className="docr-button-primary min-w-[280px] h-14 text-lg font-medium"
            >
              Start Processing
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>

        {/* Process Steps */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Simple 3-Step Process
            </h2>
            <p className="text-muted-foreground text-xl">
              Professional document processing in the comfort of darkness
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <Card className="docr-card relative group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg pointer-events-none" />
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-bold shadow-lg">
                    1
                  </div>
                </div>
                <CardTitle className="text-2xl font-medium text-foreground">
                  Upload Document
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Support for PDF, Word documents, and image files up to 10MB
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <div className="docr-feature-dot mr-3"></div>
                    Drag & drop support
                  </li>
                  <li className="flex items-center">
                    <div className="docr-feature-dot mr-3"></div>
                    Secure file handling
                  </li>
                  <li className="flex items-center">
                    <div className="docr-feature-dot mr-3"></div>
                    Multiple formats
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="docr-card relative group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg pointer-events-none" />
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20">
                    <Edit className="h-7 w-7 text-primary" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-bold shadow-lg">
                    2
                  </div>
                </div>
                <CardTitle className="text-2xl font-medium text-foreground">
                  Customize Design
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Add professional letterhead with your logo and company details
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <div className="docr-feature-dot mr-3"></div>
                    Custom letterhead
                  </li>
                  <li className="flex items-center">
                    <div className="docr-feature-dot mr-3"></div>
                    Digital signature
                  </li>
                  <li className="flex items-center">
                    <div className="docr-feature-dot mr-3"></div>
                    Brand consistency
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="docr-card relative group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg pointer-events-none" />
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20">
                    <Download className="h-7 w-7 text-primary" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-bold shadow-lg">
                    3
                  </div>
                </div>
                <CardTitle className="text-2xl font-medium text-foreground">
                  Download Result
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Get your professionally formatted document ready to use
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <div className="docr-feature-dot mr-3"></div>
                    High-quality output
                  </li>
                  <li className="flex items-center">
                    <div className="docr-feature-dot mr-3"></div>
                    Instant download
                  </li>
                  <li className="flex items-center">
                    <div className="docr-feature-dot mr-3"></div>
                    Print-ready format
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto mt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Why Choose Docr?
            </h2>
            <p className="text-muted-foreground text-lg">
              Engineered for professionals who work in the dark
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="flex items-start space-x-6 group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mt-2 backdrop-blur-sm border border-primary/20 group-hover:scale-110 transition-transform">
                <div className="w-4 h-4 rounded-full bg-primary shadow-lg"></div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-3 text-lg text-foreground">
                  Professional Quality
                </h3>
                <p className="text-muted-foreground">
                  Enterprise-grade document processing with pixel-perfect
                  results in complete darkness
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-6 group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mt-2 backdrop-blur-sm border border-primary/20 group-hover:scale-110 transition-transform">
                <div className="w-4 h-4 rounded-full bg-primary shadow-lg"></div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-3 text-lg text-foreground">
                  Secure & Private
                </h3>
                <p className="text-muted-foreground">
                  Your documents are processed securely in the shadows and never
                  stored permanently
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-6 group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mt-2 backdrop-blur-sm border border-primary/20 group-hover:scale-110 transition-transform">
                <div className="w-4 h-4 rounded-full bg-primary shadow-lg"></div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-3 text-lg text-foreground">
                  Lightning Fast
                </h3>
                <p className="text-muted-foreground">
                  Process documents in seconds with our optimized dark-mode
                  workflow
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-6 group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mt-2 backdrop-blur-sm border border-primary/20 group-hover:scale-110 transition-transform">
                <div className="w-4 h-4 rounded-full bg-primary shadow-lg"></div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-3 text-lg text-foreground">
                  Easy to Use
                </h3>
                <p className="text-muted-foreground">
                  Intuitive dark interface designed for users who prefer the
                  shadows
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
