import { Calendar, Users, MessageSquare } from 'lucide-react'

const SessionCard = ({ session, onOpenDetails, onRejoin }) => {
  const isEnded = session.status === 'ended'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="space-y-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            ID: {session.meeting_id}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${isEnded ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isEnded ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}></span>
            {isEnded ? 'Ended' : 'Active'}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 truncate">
          {session.title || 'Instant Meeting'}
        </h3>
        
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar size={14} className="text-slate-400" />
          {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-primary">
            <Users size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">{session.participants?.length || 0}</span>
            <span className="text-xs text-slate-500">Participants</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-primary">
            <MessageSquare size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">{session.messages?.length || 0}</span>
            <span className="text-xs text-slate-500">Messages</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button onClick={() => onOpenDetails(session.id)} className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
          View Details
        </button>
        {!isEnded && (
          <button onClick={() => onRejoin(session.meeting_id)} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Rejoin
          </button>
        )}
      </div>
    </div>
  )
}

export default SessionCard