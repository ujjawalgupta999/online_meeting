import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Keyboard, ArrowRight, ShieldCheck } from 'lucide-react'
import API from '../config/api'

const Dashboard = () => {
  const { user } = useUser()
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const navigate = useNavigate()
  
  const [isCreating, setIsCreating] = useState(false)
  const [joinId, setJoinId] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState(null)

  const username = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
  const userEmail = user?.primaryEmailAddress?.emailAddress

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Dashboard Stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!isLoaded || !isSignedIn) return
      try {
        const token = await getToken()
        if (!token) return
        const response = await API.get('/api/meetings/stats')
        setStats(response.data)
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to fetch stats')
      }
    }
    fetchStats()
  }, [isLoaded, isSignedIn, getToken])

  const handleCreateMeeting = async () => {
    if (!isLoaded || !isSignedIn) return
    setIsCreating(true)
    try {
      const response = await API.post('/api/meetings', {
        title: `${username}'s Meeting`
      })
      const meetingId = response.data.meeting.meeting_id
      toast.success('Meeting created')
      navigate(`/meeting/${meetingId}`)
    } catch (error) {
      toast.error(error.response?.data?.error || error.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinMeeting = async (e) => {
    e.preventDefault()
    const cleanId = joinId.trim()
    if (!cleanId) return toast.error('Please enter a valid meeting ID')

    try {
      await API.get(`/api/meetings/${cleanId}`)
      navigate(`/meeting/${cleanId}`)
    } catch (error) {
      toast.error('Meeting not found, check the ID and try again.')
    }
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column - Actions */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <ShieldCheck size={16} />
              <span>Secure peer-to-peer encryption</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
              High-quality video calls <br />
              <span className="text-primary">built for everyone</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl">
              Meet, chat, and collaborate securely from anywhere. Unlimited time limits for premium users.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button 
              onClick={handleCreateMeeting} 
              disabled={isCreating}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus size={20} />
              <span>{isCreating ? 'Creating...' : 'New Meeting'}</span>
            </button>

            <form onSubmit={handleJoinMeeting} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 shadow-sm flex-1 focus-within:ring-2 ring-primary">
              <div className="relative flex-1 flex items-center">
                <Keyboard className="absolute left-3 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Enter meeting code" 
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <button 
                type="submit" 
                disabled={!joinId.trim()}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2"
              >
                <span>Join</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - User Stats */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-slate-500 font-medium">Welcome back, <span className="text-slate-900 font-semibold">{username}</span></p>
              <h2 className="text-3xl font-bold text-slate-900">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </h2>
              <p className="text-primary font-medium tracking-wide text-sm">
                {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <p className="text-slate-500">Logged in as <span className="text-slate-900 font-medium">{userEmail}</span></p>
                <span className={`px-2.5 py-1 rounded-full font-medium ${stats?.plan === 'premium' ? 'bg-blue-50 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                  {stats?.plan === 'premium' ? 'Premium' : 'Free'}
                </span>
              </div>
              
              {stats && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Monthly Meetings</span>
                  <span className="font-medium text-slate-900">
                    {stats.plan === 'premium' ? `${stats.monthlyCount} created (Unlimited)` : `${stats.monthlyCount} / ${stats.monthlyLimit} used`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard