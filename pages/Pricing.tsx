
import React from 'react';

const PricingCard: React.FC<{ title: string; price: string; period: string; features: string[]; highlight?: boolean; }> = ({ title, price, period, features, highlight = false }) => {
  return (
    <div className={`p-8 rounded-xl border transition-all duration-300 transform hover:-translate-y-2 ${highlight ? 'bg-blue-600 text-white shadow-2xl' : 'bg-white text-gray-800 shadow-lg'}`}>
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mt-4">
        <span className="text-4xl font-bold">{price}</span>
        <span className={highlight ? 'text-blue-200' : 'text-gray-500'}>{period}</span>
      </p>
      <ul className="mt-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <svg className={`w-5 h-5 ${highlight ? 'text-blue-300' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-colors ${highlight ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
        Get Started
      </button>
    </div>
  );
};

const PricingPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Our Pricing</h1>
        <p className="mt-4 text-lg text-gray-500">Choose a plan that fits your needs.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <PricingCard 
          title="Free Plan"
          price="$0"
          period="/day"
          features={['10,000 words/day limit', 'Standard features', 'Basic support']}
        />
        <PricingCard 
          title="Unlimited Monthly"
          price="$12"
          period="/month"
          features={['Unlimited words', 'All features', 'Priority support', 'PDF reports']}
          highlight={true}
        />
        <PricingCard 
          title="Unlimited Yearly"
          price="$100"
          period="/year"
          features={['Unlimited words', 'All features', 'Dedicated support', 'Save with yearly plan']}
        />
      </div>
    </div>
  );
};

export default PricingPage;
