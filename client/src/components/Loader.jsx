import { Video } from 'lucide-react'

const Loader = ({ text = "Authenticating..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
          <Video className="absolute text-primary" size={24} />
        </div>
        <p className="mt-4 text-slate-600 font-medium animate-pulse">{text}</p>
      </div>
    </div>
  )
}

export default Loader