import { MessageSquare } from 'lucide-react'

const SessionChatTab = ({ messages = [] }) => {
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-12">
        <MessageSquare size={32} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">No chat messages were recorded in this meeting session.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map((msg, index) => (
        <div key={index} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-sm text-slate-800">{msg.senderName}</span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-slate-600 text-sm">{msg.text}</p>
        </div>
      ))}
    </div>
  )
}

export default SessionChatTab