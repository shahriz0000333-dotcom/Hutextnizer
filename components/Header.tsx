
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { SparkleIcon } from './icons/SparkleIcon';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeLinkStyle = {
    color: '#2563EB', // blue-600
    fontWeight: '600'
  };

  const navLinkClass = "text-gray-600 hover:text-blue-600 transition-colors duration-200";

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <SparkleIcon className="w-7 h-7 text-blue-600" />
            <span>HuTextnizer</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Home</NavLink>
            <NavLink to="/pricing" className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Pricing</NavLink>
            <NavLink to="/about" className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>About</NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">Login</Link>
            <Link to="/signup" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">Signup</Link>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="flex flex-col items-center gap-4 py-4">
            <NavLink to="/" className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/pricing" className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Pricing</NavLink>
            <NavLink to="/about" className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>About</NavLink>
            <div className="flex flex-col items-center gap-2 w-full px-4">
              <Link to="/login" className="w-full text-center px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="w-full text-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm" onClick={() => setIsMenuOpen(false)}>Signup</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
