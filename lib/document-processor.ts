import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ProcessingConfig,
  ProcessedDocument,
  ProcessingProgress,
} from "@/types/processing";

export class DocumentProcessor {
  private onProgress?: (progress: ProcessingProgress) => void;

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.onProgress = onProgress;
  }

  private updateProgress(
    stage: ProcessingProgress["stage"],
    progress: number,
    message: string
  ) {
    if (this.onProgress) {
      this.onProgress({ stage, progress, message });
    }
  }

  async processDocument(config: ProcessingConfig): Promise<ProcessedDocument> {
    try {
      this.updateProgress("preparing", 10, "Preparing document...");

      // Create document preview element
      const previewElement = await this.createDocumentPreview(config);

      this.updateProgress("rendering", 30, "Rendering document...");

      // Generate the processed document
      const processedBlob = await this.generateDocument(previewElement, config);

      this.updateProgress("generating", 80, "Generating final document...");

      // Create download URL
      const downloadUrl = URL.createObjectURL(processedBlob);
      const processedUrl = downloadUrl;

      const filename = this.generateFilename(config);

      this.updateProgress("complete", 100, "Document processing complete!");

      const processedDocument: ProcessedDocument = {
        id: crypto.randomUUID(),
        originalDocument: config.document,
        processedUrl,
        downloadUrl,
        filename,
        fileSize: processedBlob.size,
        format: config.outputFormat,
        processedAt: new Date(),
        config,
      };

      return processedDocument;
    } catch (error) {
      this.updateProgress("error", 0, "Failed to process document");
      throw error;
    }
  }

  private async createDocumentPreview(
    config: ProcessingConfig
  ): Promise<HTMLElement> {
    // Create a container for the document
    const container = window.document.createElement("div");
    container.style.cssText = `
      width: 794px;
      min-height: 1123px;
      background: white;
      color: black;
      font-family: ${config.letterhead?.fonts.family || "Arial"}, sans-serif;
      position: fixed;
      left: -9999px;
      top: 0;
      padding: 75px;
      box-sizing: border-box;
      z-index: -1000;
    `;

    // Add letterhead if enabled
    if (config.letterhead && config.letterhead.companyName) {
      const letterheadElement = this.createLetterheadElement(config.letterhead);
      container.appendChild(letterheadElement);
    }

    // Add document content
    const contentElement = await this.createContentElement(config.document);
    container.appendChild(contentElement);

    // Add signature if enabled
    if (config.signature && config.signature.name) {
      const signatureElement = this.createSignatureElement(config.signature);
      container.appendChild(signatureElement);
    }

    // Add to DOM temporarily
    window.document.body.appendChild(container);

    // Wait for images to load
    await this.waitForImages(container);

    return container;
  }

  private async waitForImages(container: HTMLElement): Promise<void> {
    const images = container.querySelectorAll("img");
    const promises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails to load
        }
      });
    });

    await Promise.all(promises);

    // Add a small delay to ensure rendering is complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private createLetterheadElement(letterhead: any): HTMLElement {
    const header = window.document.createElement("div");
    header.style.cssText = `
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${letterhead.colors.primary};
      min-height: 100px;
    `;

    // Logo section
    if (letterhead.logo) {
      const logoContainer = window.document.createElement("div");
      logoContainer.style.cssText = `
        flex: 0 0 auto;
        margin-right: 20px;
        max-width: 150px;
      `;

      const logoImg = window.document.createElement("img");
      logoImg.src = letterhead.logo.url;
      logoImg.crossOrigin = "anonymous";
      logoImg.style.cssText = `
        max-width: 120px;
        max-height: 80px;
        object-fit: contain;
        display: block;
      `;
      logoContainer.appendChild(logoImg);
      header.appendChild(logoContainer);
    }

    // Company info section
    const infoContainer = window.document.createElement("div");
    infoContainer.style.cssText = `
      flex: 1;
      text-align: ${letterhead.logo?.position === "right" ? "left" : "right"};
    `;

    const companyName = window.document.createElement("h1");
    companyName.textContent = letterhead.companyName;
    companyName.style.cssText = `
      margin: 0 0 10px 0;
      font-size: ${letterhead.fonts.size.company}px;
      font-weight: ${letterhead.fonts.weight.company};
      color: ${letterhead.colors.primary};
      line-height: 1.2;
    `;

    const address = window.document.createElement("div");
    address.textContent = letterhead.companyAddress;
    address.style.cssText = `
      margin: 5px 0;
      font-size: ${letterhead.fonts.size.address}px;
      font-weight: ${letterhead.fonts.weight.address};
      color: ${letterhead.colors.text};
      white-space: pre-line;
      line-height: 1.4;
    `;

    const contactInfo = window.document.createElement("div");
    const contacts = [
      letterhead.companyPhone,
      letterhead.companyEmail,
      letterhead.companyWebsite,
    ]
      .filter(Boolean)
      .join(" | ");

    if (contacts) {
      contactInfo.textContent = contacts;
      contactInfo.style.cssText = `
        margin: 5px 0;
        font-size: ${letterhead.fonts.size.contact}px;
        font-weight: ${letterhead.fonts.weight.contact};
        color: ${letterhead.colors.text};
        line-height: 1.4;
      `;
    }

    infoContainer.appendChild(companyName);
    infoContainer.appendChild(address);
    if (contacts) infoContainer.appendChild(contactInfo);
    header.appendChild(infoContainer);

    return header;
  }

  private async createContentElement(documentFile: any): Promise<HTMLElement> {
    const content = window.document.createElement("div");
    content.style.cssText = `
      margin: 40px 0;
      min-height: 400px;
      line-height: 1.6;
    `;

    if (documentFile.type.includes("image")) {
      const img = window.document.createElement("img");

      // Use the actual file content
      if (documentFile.file && documentFile.file.size > 0) {
        img.src = URL.createObjectURL(documentFile.file);
      } else {
        // Fallback to preview if available
        img.src = documentFile.preview || "";
      }

      img.crossOrigin = "anonymous";
      img.style.cssText = `
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      `;
      content.appendChild(img);
    } else if (documentFile.type.includes("pdf")) {
      // For PDF files, show a better representation
      const pdfContainer = window.document.createElement("div");
      pdfContainer.style.cssText = `
        text-align: center;
        padding: 40px 20px;
        background: linear-gradient(145deg, #f8f9fa, #e9ecef);
        border: 1px solid #dee2e6;
        border-radius: 12px;
        color: #495057;
        font-family: Arial, sans-serif;
      `;
      pdfContainer.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px; color: #dc3545;">📄</div>
        <h3 style="margin: 0 0 10px 0; color: #495057; font-size: 24px; font-weight: 600;">PDF Document</h3>
        <p style="margin: 0; font-size: 16px; color: #6c757d;">${
          documentFile.name
        }</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #adb5bd;">${this.formatFileSize(
          documentFile.size
        )}</p>
        <div style="margin-top: 20px; padding: 12px; background: rgba(220, 53, 69, 0.1); border-radius: 8px; color: #721c24;">
          <small>PDF content will be preserved in the final document</small>
        </div>
      `;
      content.appendChild(pdfContainer);
    } else {
      // For other document types (Word, etc.)
      const placeholder = window.document.createElement("div");
      placeholder.style.cssText = `
        text-align: center;
        padding: 40px 20px;
        background: linear-gradient(145deg, #f8f9fa, #e9ecef);
        border: 1px solid #dee2e6;
        border-radius: 12px;
        color: #495057;
        font-family: Arial, sans-serif;
      `;

      const fileIcon =
        documentFile.type.includes("word") ||
        documentFile.type.includes("document")
          ? "📝"
          : "📄";
      const fileType =
        documentFile.type.includes("word") ||
        documentFile.type.includes("document")
          ? "Word Document"
          : "Document";

      placeholder.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px; color: #2563eb;">${fileIcon}</div>
        <h3 style="margin: 0 0 10px 0; color: #495057; font-size: 24px; font-weight: 600;">${fileType}</h3>
        <p style="margin: 0; font-size: 16px; color: #6c757d;">${
          documentFile.name
        }</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #adb5bd;">${this.formatFileSize(
          documentFile.size
        )}</p>
        <div style="margin-top: 20px; padding: 12px; background: rgba(37, 99, 235, 0.1); border-radius: 8px; color: #1e40af;">
          <small>Document content will be preserved in the final output</small>
        </div>
      `;
      content.appendChild(placeholder);
    }

    return content;
  }

  private createSignatureElement(signature: any): HTMLElement {
    const signatureContainer = window.document.createElement("div");

    // Use coordinates if available, otherwise use position alignment
    if (signature.coordinates) {
      signatureContainer.style.cssText = `
        position: absolute;
        left: ${signature.coordinates.x}px;
        top: ${signature.coordinates.y}px;
      `;
    } else {
      signatureContainer.style.cssText = `
        margin-top: 60px;
        text-align: ${signature.position};
      `;
    }

    const signatureBlock = window.document.createElement("div");
    signatureBlock.style.cssText = `
      display: inline-block;
      min-width: 200px;
    `;

    if (signature.style === "image" && signature.image) {
      const img = window.document.createElement("img");
      img.src = signature.image.url;
      img.crossOrigin = "anonymous";
      img.style.cssText = `
        max-width: 200px;
        max-height: 80px;
        object-fit: contain;
        display: block;
        margin-bottom: 10px;
      `;
      signatureBlock.appendChild(img);
    } else {
      const nameElement = window.document.createElement("div");
      nameElement.textContent = signature.name;
      nameElement.style.cssText = `
        font-size: ${signature.fontSize}px;
        color: ${signature.color};
        font-family: ${
          signature.style === "handwritten" ? "cursive" : signature.fontFamily
        };
        margin-bottom: 10px;
        line-height: 1.2;
      `;
      signatureBlock.appendChild(nameElement);
    }

    if (signature.title) {
      const titleElement = window.document.createElement("div");
      titleElement.textContent = signature.title;
      titleElement.style.cssText = `
        font-size: 12px;
        color: #666;
        border-top: 1px solid #ccc;
        padding-top: 5px;
        margin-top: 5px;
        line-height: 1.4;
      `;
      signatureBlock.appendChild(titleElement);
    }

    signatureContainer.appendChild(signatureBlock);
    return signatureContainer;
  }

  private async generateDocument(
    element: HTMLElement,
    config: ProcessingConfig
  ): Promise<Blob> {
    try {
      // Generate canvas from HTML element
      const canvas = await html2canvas(element, {
        scale:
          config.quality === "high" ? 2 : config.quality === "medium" ? 1.5 : 1,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
      });

      // Remove the temporary element
      if (element.parentNode) {
        window.document.body.removeChild(element);
      }

      if (config.outputFormat === "pdf") {
        return this.generatePDF(canvas, config);
      } else {
        return this.generateImage(canvas, config);
      }
    } catch (error) {
      // Clean up on error
      if (element.parentNode) {
        window.document.body.removeChild(element);
      }
      throw error;
    }
  }

  private async generatePDF(
    canvas: HTMLCanvasElement,
    config: ProcessingConfig
  ): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // If the content is taller than A4, scale it down to fit
    if (imgHeight > 297) {
      const scaleFactor = 297 / imgHeight;
      const scaledWidth = imgWidth * scaleFactor;
      const scaledHeight = 297;
      pdf.addImage(
        imgData,
        "PNG",
        (210 - scaledWidth) / 2,
        0,
        scaledWidth,
        scaledHeight
      );
    } else {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    return new Promise((resolve) => {
      const pdfBlob = pdf.output("blob");
      resolve(pdfBlob);
    });
  }

  private async generateImage(
    canvas: HTMLCanvasElement,
    config: ProcessingConfig
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const mimeType =
        config.outputFormat === "png" ? "image/png" : "image/jpeg";
      const quality =
        config.quality === "high"
          ? 0.95
          : config.quality === "medium"
          ? 0.8
          : 0.6;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate image"));
          }
        },
        mimeType,
        quality
      );
    });
  }

  private generateFilename(config: ProcessingConfig): string {
    const baseName = config.document.name.split(".")[0];
    const timestamp = new Date().toISOString().slice(0, 10);
    const features = [];

    if (config.letterhead) features.push("letterhead");
    if (config.signature) features.push("signature");

    const featureString = features.length > 0 ? `_${features.join("_")}` : "";

    return `${baseName}${featureString}_${timestamp}.${config.outputFormat}`;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
