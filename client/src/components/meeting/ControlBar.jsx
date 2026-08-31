import { useState } from 'react'
import { Mic, MicOff, Video, VideoOff, MessageSquare, Users, PhoneOff, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const ControlBar = ({ roomId, audioEnabled, videoEnabled, onToggleAudio, onToggleVideo, onToggleChat, onToggleParticipants, isChatOpen, isParticipantsOpen, unreadCount, participantsCount, isHost, onLeave, onEndMeeting }) => {
  const [copied, setCopied] = useState(false)

  const copyMeetingId = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Meeting link copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <footer className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-20">
      {/* Left Column */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="bg-slate-800 text-slate-300 font-mono text-sm px-3 py-1.5 rounded-md border border-slate-700">{roomId}</span>
        <button onClick={copyMeetingId} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded-md">
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Center Controls */}
      <div className="flex items-center gap-3 mx-auto sm:mx-0">
        <button onClick={onToggleAudio} className={`p-3.5 rounded-full transition-all ${audioEnabled ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'}`} title={audioEnabled ? "Mute microphone" : "Unmute microphone"}>
          {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={onToggleVideo} className={`p-3.5 rounded-full transition-all ${videoEnabled ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'}`} title={videoEnabled ? "Turn off camera" : "Turn on camera"}>
          {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button onClick={onToggleChat} className={`p-3.5 rounded-full transition-all relative ${isChatOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`} title="Toggle chat">
          <MessageSquare size={20} />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-slate-900">{unreadCount}</span>
          )}
        </button>
        <button onClick={onToggleParticipants} className={`p-3.5 rounded-full transition-all relative ${isParticipantsOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`} title="Toggle participants">
          <Users size={20} />
          <span className="absolute -top-1 -right-1 bg-slate-600 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-slate-900">{participantsCount}</span>
        </button>

        {/* Leave / End Button */}
        {isHost ? (
          <button onClick={onEndMeeting} className="flex items-center gap-2 px-4 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors ml-2 shadow-lg shadow-rose-900/20" title="End meeting for all">
            <PhoneOff size={18} />
            <span className="hidden md:inline">End Meeting</span>
          </button>
        ) : (
          <button onClick={onLeave} className="flex items-center gap-2 px-4 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors ml-2 shadow-lg shadow-rose-900/20" title="Leave meeting">
            <PhoneOff size={18} />
          </button>
        )}
      </div>

      {/* Right Placeholder */}
      <div className="hidden sm:block w-[150px] text-right">
        <span className="text-slate-500 text-sm font-medium">Meeting Room</span>
      </div>
    </footer>
  )
}

export default ControlBar