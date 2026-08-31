import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import API from '../config/api'

import { useWebRTC } from '../hooks/useWebRTC'
import { useChat } from '../hooks/useChat'
import VideoGrid from '../components/meeting/VideoGrid'
import ChatPanel from '../components/meeting/ChatPanel'
import ParticipantsList from '../components/meeting/ParticipantsList'
import ControlBar from '../components/meeting/ControlBar'
import Loader from '../components/Loader'

const MeetingRoom = () => {
  const { id: meetingId } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const { getToken } = useAuth()

  const [meeting, setMeeting] = useState(null)
  const [loadingMeeting, setLoadingMeeting] = useState(true)
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)

  const userData = useMemo(() => {
    if (!user) return null
    return {
      id: user.id,
      name: user.fullName || user.firstName || 'User',
      email: user.primaryEmailAddress?.emailAddress,
      imageUrl: user.imageUrl
    }
  }, [user])

  // Fetch meeting details before connecting
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = await getToken()
        const response = await API.get(`/api/meetings/${meetingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.meeting.status === 'ended') {
          toast.error('This meeting has ended')
          navigate('/dashboard')
          return
        }
        setMeeting(response.data.meeting)
      } catch (error) {
        toast.error(error.response?.data?.error || 'Meeting not found')
        navigate('/dashboard')
      } finally {
        setLoadingMeeting(false)
      }
    }
    fetchMeeting()
  }, [meetingId, getToken, navigate])

  const handleMeetingEnded = () => {
    navigate('/dashboard')
  }

  // Initialize WebRTC and Socket
  const {
    localStream, remoteUsers, audioEnabled, videoEnabled,
    toggleAudio, toggleVideo, endMeeting
  } = useWebRTC(meetingId, userData, handleMeetingEnded)

  // Initialize Chat
  const {
    messages, sendMessage, unreadCount, isChatOpen, toggleChat
  } = useChat(meetingId, userData)

  const isHost = meeting?.host?.id?.toString() === userData?.id?.toString()

  const handleLeave = () => {
    toast.success('You left the meeting')
    navigate('/dashboard')
  }

  const handleEndMeeting = () => {
    endMeeting()
    toast('Meeting ended for all participants')
    navigate('/dashboard')
  }

  if (loadingMeeting) return <Loader text="Joining meeting room..." />

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden text-slate-100">
      
      {/* Top Header */}
      <header className="h-14 px-4 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-medium">{meeting?.title}</h2>
          <span className="text-slate-500 text-sm border-l border-slate-700 pl-3">{meeting?.meeting_id}</span>
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse ml-2"></span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Video Grid */}
        <VideoGrid 
          localStream={localStream} 
          localUser={userData} 
          remoteUsers={remoteUsers} 
          audioEnabled={audioEnabled} 
          videoEnabled={videoEnabled} 
        />

        {/* Side Panels */}
        <ChatPanel 
          isOpen={isChatOpen} 
          onClose={toggleChat} 
          messages={messages} 
          onSendMessage={sendMessage} 
          currentUser={userData} 
        />
        <ParticipantsList 
          isOpen={isParticipantsOpen} 
          onClose={() => setIsParticipantsOpen(false)} 
          localUser={userData} 
          localAudio={audioEnabled} 
          localVideo={videoEnabled} 
          remoteUsers={remoteUsers} 
          meetingHostId={meeting?.host?.id} 
        />
      </div>

      {/* Floating Control Bar */}
      <ControlBar 
        roomId={meetingId}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onToggleParticipants={() => setIsParticipantsOpen(p => !p)}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        unreadCount={unreadCount}
        participantsCount={1 + remoteUsers.length}
        isHost={isHost}
        onLeave={handleLeave}
        onEndMeeting={handleEndMeeting}
      />
    </div>
  )
}

export default MeetingRoom