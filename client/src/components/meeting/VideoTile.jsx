import { useEffect, useRef } from 'react'
import { User, VideoOff, MicOff } from 'lucide-react'

const VideoTile = ({ stream, name, isLocal = false, audioEnabled = true, videoEnabled = true }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video shadow-lg border border-slate-700/50 flex flex-col">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-300 ${videoEnabled ? 'opacity-100' : 'opacity-0'} ${isLocal ? 'scale-x-[-1]' : ''}`}
      />

      {/* Camera Off Placeholder */}
      {!videoEnabled && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/95 z-10">
          <div className="h-16 w-16 bg-slate-700 rounded-full flex items-center justify-center mb-3 text-2xl font-semibold text-white">
            {name ? name.charAt(0).toUpperCase() : <User size={32} />}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-900/50 px-3 py-1.5 rounded-full">
            <VideoOff size={14} />
            <span>Camera off</span>
          </div>
        </div>
      )}

      {/* Bottom Info Bar Overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg border border-white/10">
          <span className="font-medium truncate max-w-[120px]">{name} {isLocal ? '(You)' : ''}</span>
        </div>
        
        {!audioEnabled && (
          <span className="p-2 rounded-lg bg-rose-500/90 text-white backdrop-blur-sm border border-rose-400/20 shadow-sm">
            <MicOff size={14} />
          </span>
        )}
      </div>
    </div>
  )
}

export default VideoTile