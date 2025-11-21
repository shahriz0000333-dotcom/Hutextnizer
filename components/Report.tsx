
import React, { useRef } from 'react';
import type { ReportData } from '../types';

interface ReportProps {
  reportData: ReportData;
}

const Report: React.FC<ReportProps> = ({ reportData }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const { jsPDF } = window.jspdf;
    const canvas = await window.html2canvas(reportRef.current!, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("HuTextnizer-Report.pdf");
  };

  const MetricCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-blue-50/50 p-4 rounded-lg text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-blue-700">{value}</p>
    </div>
  );

  return (
    <div className="mt-8">
      <div ref={reportRef} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">AI Text Humanizer & Originality Enhancer</h2>
        <p className="text-center text-gray-500 mb-6">Brief Report</p>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">1. Summary of Improvements</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Humanized tone and natural sentence flow</li>
            <li>Improved clarity, vocabulary, and structure</li>
            <li>Reduced robotic or AI-generated patterns</li>
            <li>Enhanced originality and textual diversity</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">2. Key Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard label="Original Word Count" value={`${reportData.originalWordCount} words`} />
            <MetricCard label="Final Word Count" value={`${reportData.finalWordCount} words`} />
            <MetricCard label="Plagiarism Before" value={reportData.plagiarismBefore} />
            <MetricCard label="Plagiarism After" value={reportData.plagiarismAfter} />
            <MetricCard label="Human-Likeness Score" value={reportData.humanLikenessScore} />
            <MetricCard label="Readability Level" value={reportData.readabilityLevel} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">3. Core Enhancements Applied</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Grammar and punctuation corrections</li>
            <li>Sentence restructuring for readability</li>
            <li>Removal of duplicated or low-quality segments</li>
            <li>Tone consistency and contextual alignment</li>
            <li>Improved transitions and paragraph flow</li>
          </ul>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <button
          onClick={handleDownloadPdf}
          className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md transform hover:scale-105"
        >
          Download PDF Report
        </button>
      </div>
    </div>
  );
};

export default Report;