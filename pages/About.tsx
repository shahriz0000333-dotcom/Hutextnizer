
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">About Us</h1>
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <p>
          Welcome to our AI Text Humanizer & Plagiarism Remover, a smart and reliable writing assistant built to make your content sound truly human, original, and professional.
        </p>
        <p>
          We created this platform for students, writers, bloggers, and professionals who want their ideas to shine without worrying about robotic wording, AI detection, or accidental plagiarism. Our advanced technology rewrites your text with clarity, flow, and personality while keeping your original meaning intact.
        </p>
        <p>
          Whether you're polishing an assignment, preparing content for clients, or enhancing your website text, our tool helps you write confidently with:
        </p>
        <ul className="list-none space-y-3 pl-2">
          <li className="flex items-start"><span className="text-blue-600 mr-2">✓</span> Human-like rewriting</li>
          <li className="flex items-start"><span className="text-blue-600 mr-2">✓</span> Accurate plagiarism reduction</li>
          <li className="flex items-start"><span className="text-blue-600 mr-2">✓</span> Tone improvement</li>
          <li className="flex items-start"><span className="text-blue-600 mr-2">✓</span> Grammar and readability enhancements</li>
          <li className="flex items-start"><span className="text-blue-600 mr-2">✓</span> Detailed quality reports</li>
        </ul>
        <div className="border-t my-6"></div>
        <p className="font-semibold text-gray-700 text-center text-lg">
          Our mission is simple:
        </p>
        <p className="text-center italic text-gray-800">
          To help you express your thoughts naturally, uniquely, and with complete confidence.
        </p>
        <p>
          Thank you for choosing our platform. We're here to make your writing smoother, stronger, and truly yours.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
