import { User, Crown } from 'lucide-react'

const SessionParticipantsTab = ({ participants = [], host }) => {
  if (participants.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-12">
        <User size={32} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">No participant logs recorded.</p>
      </div>
    )
  }

  const hostId = host?.id

  return (
    <div className="space-y-2.5">
      {participants.map((p, index) => {
        const participantUserId = p.user?.id || p.userId
        const isHost = Boolean(hostId && participantUserId && participantUserId.toString() === hostId.toString())

        return (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 font-medium">
                {p.name ? p.name.charAt(0).toUpperCase() : <User size={18} />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  {p.name} 
                  {isHost && <Crown size={14} className="text-amber-500" title="Host" />}
                </span>
                {p.email && <span className="text-xs text-slate-500">{p.email}</span>}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono block">
                Joined: {new Date(p.joined_at || p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SessionParticipantsTab