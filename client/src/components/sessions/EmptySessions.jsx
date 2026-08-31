import { Link } from 'react-router-dom'
import { History, ArrowRight } from 'lucide-react'

const EmptySessions = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <History size={32} className="text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">No meeting history yet</h3>
      <p className="text-slate-500 max-w-sm mb-6">Your past meetings, chat logs, and participant lists will appear here.</p>
      
      <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
        <span>Start a Meeting</span>
        <ArrowRight size={18} />
      </Link>
    </div>
  )
}

export default EmptySessions