import { useState } from 'react'
import { X } from 'lucide-react'
import SessionChatTab from './SessionChatTab'
import SessionParticipantsTab from './SessionParticipantsTab'

const SessionDetailModal = ({ session, onClose }) => {
  const [activeTab, setActiveTab] = useState('chat')

  if (!session) return null
  const isEnded = session.status === 'ended'

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">ID: {session.meeting_id}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isEnded ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                {isEnded ? 'Ended' : 'Active'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{session.title || 'Meeting Details'}</h2>
            <p className="text-sm text-slate-500 mt-1">
              Host: {session.host?.name || 'Unknown'} • Created: {new Date(session.created_at).toLocaleString()}
            </p>
          </div>
          
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" aria-label="Close session details">
            <X size={20} />
          </button>
        </div>

        {/* Tab Title */}
        <div className="px-6 border-b border-slate-200 flex gap-6 bg-white">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors relative ${activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Chat Transcript ({session.messages?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('participants')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors relative ${activeTab === 'participants' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Participants Log ({session.participants?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeTab === 'chat' ? (
            <SessionChatTab messages={session.messages} />
          ) : (
            <SessionParticipantsTab participants={session.participants} host={session.host} />
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionDetailModal