"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { FileText, PenTool, Settings } from "lucide-react";

interface FeatureToggleProps {
  letterheadEnabled: boolean;
  signatureEnabled: boolean;
  onLetterheadToggle: (enabled: boolean) => void;
  onSignatureToggle: (enabled: boolean) => void;
}

export function FeatureToggle({
  letterheadEnabled,
  signatureEnabled,
  onLetterheadToggle,
  onSignatureToggle,
}: FeatureToggleProps) {
  return (
    <Card className="docr-card w-full max-w-4xl mx-auto mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg pointer-events-none" />
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl font-medium">
              Feature Selection
            </CardTitle>
            <CardDescription>
              Choose which features to apply to your document
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Letterhead Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-secondary/40">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  Professional Letterhead
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add company branding to your document
                </p>
              </div>
            </div>
            <Switch
              checked={letterheadEnabled}
              onCheckedChange={onLetterheadToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Signature Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-secondary/40">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <PenTool className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  Digital Signature
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sign your document digitally
                </p>
              </div>
            </div>
            <Switch
              checked={signatureEnabled}
              onCheckedChange={onSignatureToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        {/* Info Message */}
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-primary">
            <strong>Pro Tip:</strong> You can enable one or both features based
            on your needs.
            {!letterheadEnabled &&
              !signatureEnabled &&
              " At least one feature must be enabled to process your document."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
