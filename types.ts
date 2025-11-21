export interface ReportData {
  originalWordCount: number;
  finalWordCount: number;
  plagiarismBefore: string;
  plagiarismAfter: string;
  humanLikenessScore: string;
  readabilityLevel: 'Basic' | 'Intermediate' | 'Advanced';
}

export interface AiResponse {
  processedText: string;
  report: ReportData;
}

// FIX: Defined the AIStudio interface to resolve a TypeScript error about subsequent property declarations.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
    aistudio?: AIStudio;
  }
}
