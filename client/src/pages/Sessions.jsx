import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../config/api'

import SessionCard from '../components/sessions/SessionCard'
import EmptySessions from '../components/sessions/EmptySessions'
import SessionDetailModal from '../components/sessions/SessionDetailModal'
import Loader from '../components/Loader'

const Sessions = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const navigate = useNavigate()
  
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      if (!isLoaded || !isSignedIn) return
      try {
        const token = await getToken()
        if (!token) return
        const response = await API.get('/api/meetings/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSessions(response.data.meetings || [])
      } catch (error) {
        toast.error('Failed to load meeting sessions')
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [isLoaded, isSignedIn, getToken])

  const openSessionDetails = async (sessionId) => {
    try {
      const token = await getToken()
      const response = await API.get(`/api/meetings/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedSession(response.data.meeting)
    } catch (error) {
      toast.error('Could not fetch session details')
    }
  }

  const handleRejoin = (meetingId) => {
    navigate(`/meeting/${meetingId}`)
  }

  if (loading) return <Loader text="Loading meeting history..." />

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Navigation Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft size={16} /> Go to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Meeting Sessions</h1>
        <p className="text-slate-600 mt-1">Review your past meetings, chat logs, and participants.</p>
      </div>

      {/* Session Grid / Empty State */}
      {sessions.length === 0 ? (
        <EmptySessions />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard 
              key={session.id} 
              session={session} 
              onOpenDetails={() => openSessionDetails(session.meeting_id)} 
              onRejoin={handleRejoin} 
            />
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal 
        session={selectedSession} 
        onClose={() => setSelectedSession(null)} 
      />
    </main>
  )
}

export default Sessions