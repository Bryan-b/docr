"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { SignatureConfig } from "@/types/letterhead";
import { Move, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DraggableSignatureProps {
  signature: SignatureConfig;
  onPositionChange: (coordinates: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLElement>;
  scale?: number;
}

export function DraggableSignature({
  signature,
  onPositionChange,
  containerRef,
  scale = 1,
}: DraggableSignatureProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(
    signature.coordinates || { x: 20, y: 400 }
  );
  const signatureRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!containerRef.current || !signatureRef.current) return;

      // Record the initial mouse position and element position
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialPosition({ x: position.x, y: position.y });
      setIsDragging(true);
    },
    [position, containerRef]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      e.preventDefault();

      // Calculate how much the mouse has moved since drag started
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Apply the delta to the initial position, accounting for scale
      const newX = initialPosition.x + deltaX / scale;
      const newY = initialPosition.y + deltaY / scale;

      // Get container bounds for constraints
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerPadding = 75; // 20mm padding

      // Calculate usable area (accounting for padding and scale)
      const maxX = (containerRect.width - containerPadding * 2) / scale - 200; // signature width
      const maxY = (containerRect.height - containerPadding * 2) / scale - 100; // signature height

      // Constrain to container bounds
      const constrainedPosition = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      };

      setPosition(constrainedPosition);
      onPositionChange(constrainedPosition);
    },
    [
      isDragging,
      dragStart,
      initialPosition,
      scale,
      containerRef,
      onPositionChange,
    ]
  );

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Handle mouse events
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e: MouseEvent) => handleMouseMove(e);
      const handleUp = (e: MouseEvent) => handleMouseUp(e);

      document.addEventListener("mousemove", handleMove, { passive: false });
      document.addEventListener("mouseup", handleUp, { passive: false });

      // Prevent text selection while dragging
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
      document.body.style.cursor = "move";

      return () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Update position when signature coordinates change externally
  useEffect(() => {
    if (signature.coordinates && !isDragging) {
      setPosition(signature.coordinates);
    }
  }, [signature.coordinates, isDragging]);

  const resetPosition = () => {
    const defaultPosition = { x: 20, y: 400 };
    setPosition(defaultPosition);
    onPositionChange(defaultPosition);
  };

  return (
    <div
      ref={signatureRef}
      className={cn(
        "absolute cursor-move group border-2 border-dashed transition-all duration-200 select-none",
        isDragging
          ? "border-primary shadow-lg z-50"
          : "border-transparent hover:border-primary/50",
        "min-w-[200px] p-2 rounded"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: "none",
        WebkitUserSelect: "none",
        pointerEvents: "auto",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag Handle */}
      <div
        className={cn(
          "absolute -top-8 left-0 right-0 flex items-center justify-between transition-opacity z-10",
          isDragging || "group-hover" ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center space-x-1 bg-primary text-primary-foreground px-2 py-1 rounded-t text-xs shadow-lg">
          <Move className="h-3 w-3" />
          <span>Drag to position</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-6 w-6 p-0 bg-background shadow-lg border"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            resetPosition();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>

      {/* Position Indicator */}
      {isDragging && (
        <div className="absolute -bottom-8 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs shadow-lg z-10">
          X: {Math.round(position.x)}, Y: {Math.round(position.y)}
        </div>
      )}

      {/* Signature Content */}
      <div
        className={cn(
          "bg-white/95 backdrop-blur-sm rounded p-3 shadow-md border border-gray-200 relative",
          isDragging && "shadow-xl scale-105"
        )}
        style={{
          pointerEvents: "none", // Prevent interference with dragging
          transition: isDragging ? "none" : "all 0.2s ease",
        }}
      >
        <div style={{ textAlign: signature.position }}>
          {signature.style === "image" && signature.image ? (
            <img
              src={signature.image.url}
              alt="Signature"
              className="max-w-[200px] max-h-[80px] object-contain block mb-1"
              draggable={false}
              style={{ pointerEvents: "none" }}
            />
          ) : (
            <div
              className="mb-1"
              style={{
                fontSize: signature.fontSize,
                color: signature.color,
                fontFamily:
                  signature.style === "handwritten"
                    ? "cursive"
                    : signature.fontFamily,
                pointerEvents: "none",
              }}
            >
              {signature.name}
            </div>
          )}

          {signature.title && (
            <div
              className="text-xs text-gray-600 border-t border-gray-300 pt-1 mt-1"
              style={{ pointerEvents: "none" }}
            >
              {signature.title}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
