
import React, { useState } from 'react';
import type { AiResponse } from '../types';
import { humanizeTextAndGenerateReport } from '../services/geminiService';
import Report from '../components/Report';

const HomePage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to process.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await humanizeTextAndGenerateReport(inputText);
      setResult(response);
    } catch (err) {
      setError('An error occurred while processing the text. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderOutputBox = (title: string, text: string) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">{title}</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{text}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">AI Text Humanizer</h1>
        <p className="mt-4 text-lg text-gray-500">
          Transform your AI-generated text into natural, human-like content and ensure originality.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your text here..."
          className="w-full h-48 p-4 border border-gray-200 rounded-lg bg-blue-50/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
          disabled={isLoading}
        />

        <div className="mt-4 flex justify-center">
          <button 
            onClick={handleProcessText} 
            disabled={isLoading} 
            className="w-full sm:w-auto px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Humanize & Enhance
          </button>
        </div>
      </div>
      
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      
      {isLoading && (
        <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-blue-700">Please wait… we’re carefully enhancing your text for natural tone and originality.</p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
            {renderOutputBox('✅ Enhanced & Original Text', result.processedText)}
            <Report reportData={result.report} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
