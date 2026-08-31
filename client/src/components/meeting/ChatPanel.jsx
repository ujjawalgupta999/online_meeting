import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'

const ChatPanel = ({ isOpen, onClose, messages, onSendMessage, currentUser }) => {
  const [text, setText] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      onSendMessage(text)
      setText('')
    }
  }

  if (!isOpen) return null

  return (
    <aside className="w-80 h-full bg-white border-l border-slate-200 flex flex-col z-20 shrink-0 shadow-xl transition-all">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800">In-call Chat</h3>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Message Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser?.id
            return (
              <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-700">{isMe ? 'You' : msg.senderName}</span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
                <div className={`px-3 py-2 rounded-2xl max-w-[90%] text-sm ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 placeholder:text-slate-400"
        />
        <button type="submit" disabled={!text.trim()} className="p-2 rounded-full bg-primary text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-primary transition-colors flex shrink-0 items-center justify-center">
          <Send size={16} className="-ml-0.5" />
        </button>
      </form>
    </aside>
  )
}

export default ChatPanel