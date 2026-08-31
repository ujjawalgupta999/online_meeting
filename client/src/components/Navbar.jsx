import { Link, useLocation } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { LayoutDashboard, History, Asterisk } from 'lucide-react'

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser()
  const location = useLocation()
  
  const username = user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Meetup Logo" className="size-6.5" />
            <span className="text-2xl font-medium tracking-tight text-slate-900 flex items-center">
              Meetup<span className="text-primary">.</span>
            </span>
          </Link>

          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Link to="/dashboard" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${location.pathname === '/dashboard' ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/sessions" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${location.pathname === '/sessions' ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                <History size={16} /> Sessions
              </Link>
              <Link to="/pricing" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${location.pathname === '/pricing' ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Asterisk size={16} /> Pricing
              </Link>
            </nav>
          )}
        </div>

        {/* User Profile */}
        {isSignedIn && (
          <div className="flex items-center gap-4">
            <Link to="/sessions" className="md:hidden text-slate-500 hover:text-slate-700">
              <History size={20} />
            </Link>
            <span className="hidden sm:block text-sm text-slate-600">
              Welcome, <span className="font-medium text-slate-900">{username}</span>
            </span>
            <UserButton afterSignOutUrl="/login" />
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar