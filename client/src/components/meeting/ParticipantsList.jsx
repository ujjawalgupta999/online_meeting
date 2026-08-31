import { X, Crown, Mic, MicOff, Video, VideoOff, User } from 'lucide-react'

const ParticipantsList = ({ isOpen, onClose, localUser, localAudio, localVideo, remoteUsers, meetingHostId }) => {
  if (!isOpen) return null

  // Combine local and remote users into one array
  const allParticipants = [
    {
      socketId: 'local',
      userId: localUser?.id,
      username: `${localUser?.name || 'You'} (You)`,
      audioEnabled: localAudio,
      videoEnabled: localVideo,
      isLocal: true
    },
    ...remoteUsers
  ]

  return (
    <aside className="w-80 h-full bg-white border-l border-slate-200 flex flex-col z-20 shrink-0 shadow-xl transition-all">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800">
          Participants <span className="text-slate-500 font-normal">({allParticipants.length})</span>
        </h3>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {allParticipants.map((participant) => {
          const isHost = participant.userId === meetingHostId
          
          return (
            <div key={participant.socketId} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors mb-1">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-9 w-9 shrink-0 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm">
                  {participant.username ? participant.username.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5 truncate">
                    <span className="truncate">{participant.username}</span>
                    {isHost && <Crown size={14} className="text-amber-500 shrink-0" title="Host" />}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {participant.audioEnabled ? (
                  <Mic size={16} className="text-slate-400" />
                ) : (
                  <div className="bg-rose-100 p-1 rounded">
                    <MicOff size={14} className="text-rose-600" />
                  </div>
                )}
                
                {participant.videoEnabled ? (
                  <Video size={16} className="text-slate-400" />
                ) : (
                  <div className="bg-rose-100 p-1 rounded">
                    <VideoOff size={14} className="text-rose-600" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default ParticipantsList