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

declare global {
  // FIX: Moved the AIStudio interface into `declare global` to make it a truly global type. This resolves the "Subsequent property declarations must have the same type" error by ensuring all augmentations of `window.aistudio` refer to the same interface.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    jspdf: any;
    html2canvas: any;
    aistudio?: AIStudio;
  }
}
