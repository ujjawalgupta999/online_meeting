import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Sparkles } from 'lucide-react'; 
import { UserButton, useUser } from '@clerk/clerk-react';

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  // Extract the username dynamically from Clerk's user object
  const username = user?.fullName || 
                   user?.firstName || 
                   user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 
                   'User';

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      
      {/* --- Left Column: Brand Logo & Navigation Links --- */}
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Meetup Logo" className="w-6.5 h-6.5" />
          <span className="text-2xl font-medium tracking-tight flex items-center">
            meetup<span className="text-blue-600">.</span>
          </span>
        </Link>

        {/* Display Navigation Links only if the user is signed in */}
        {isSignedIn && (
          <nav className="hidden md:flex items-center gap-4 ml-6">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            
            <Link
              to="/sessions"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/sessions'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4" />
              Sessions
            </Link>

            <Link
              to="/pricing"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/pricing'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Pricing
            </Link>
          </nav>
        )}
      </div>


    </header>
  );
};

export default Navbar;