
import React from 'react';
import { Link } from 'react-router-dom';

const SignupPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
        <form className="space-y-6">
          <div>
            <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              id="email-signup"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              id="password-signup"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Create a password"
            />
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Sign up
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
