export interface LetterheadConfig {
  id: string;
  companyName: string;
  companyAddress: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  logo?: LogoConfig;
  colors: ColorConfig;
  fonts: FontConfig;
  layout: LayoutConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogoConfig {
  file: File;
  url: string;
  width: number;
  height: number;
  position: "left" | "center" | "right";
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  text: string;
  background: string;
}

export interface FontConfig {
  family: string;
  size: {
    company: number;
    address: number;
    contact: number;
  };
  weight: {
    company: number;
    address: number;
    contact: number;
  };
}

export interface LayoutConfig {
  headerHeight: number;
  footerHeight: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface SignatureConfig {
  id: string;
  name: string;
  title: string;
  image?: SignatureImageConfig;
  style: "handwritten" | "typed" | "image";
  color: string;
  fontSize: number;
  fontFamily: string;
  position: "left" | "center" | "right";
  coordinates?: { x: number; y: number };
  createdAt: Date;
}

export interface SignatureImageConfig {
  file: File;
  url: string;
  width: number;
  height: number;
}

export const DEFAULT_LETTERHEAD_CONFIG: Omit<
  LetterheadConfig,
  "id" | "createdAt" | "updatedAt"
> = {
  companyName: "",
  companyAddress: "",
  companyPhone: "",
  companyEmail: "",
  companyWebsite: "",
  colors: {
    primary: "#4facfe",
    secondary: "#21262d",
    text: "#f0f6fc",
    background: "#0f1014",
  },
  fonts: {
    family: "Roboto",
    size: {
      company: 24,
      address: 14,
      contact: 12,
    },
    weight: {
      company: 700,
      address: 400,
      contact: 400,
    },
  },
  layout: {
    headerHeight: 120,
    footerHeight: 80,
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },
};
