import { useState, useRef, useCallback, useEffect } from 'react';
import { socket } from '../config/socket';
import toast from 'react-hot-toast';


const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const useWebRTC = (roomId, user, onMeetingEnded) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());

  // 1. Initialize local camera & mic
  const initLocalStream = useCallback(async () => {
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
      }
    } catch (error) {
      console.error('Camera access denied or unavailable.', error);
      toast.error('Could not access camera/microphone');
      return null;
    }
  }, []);

  // 2. Helper to create a WebRTC Peer Connection
  const createPeerConnection = useCallback((targetSocketId, remoteUser) => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);


    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

   
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          targetSocketId,
          senderSocketId: socket.id,
          candidate: event.candidate
        });
      }
    };

    // Receive the remote user's video/audio tracks
    peerConnection.ontrack = (event) => {
      setRemoteUsers(prev => {
        const existing = prev.find(u => u.socketId === targetSocketId);
        if (existing) return prev; 
        
        return [...prev, {
          socketId: targetSocketId,
          stream: event.streams[0],
          username: remoteUser?.username || remoteUser?.name || 'User',
          audioEnabled: remoteUser?.audioEnabled ?? true,
          videoEnabled: remoteUser?.videoEnabled ?? true
        }];
      });
    };

    peersRef.current.set(targetSocketId, peerConnection);
    return peerConnection;
  }, []);

  // 3. Connect to Socket and handle WebRTC Signaling
  useEffect(() => {
    let isMounted = true;

    const startConnection = async () => {
      const stream = await initLocalStream();
      if (stream && isMounted) {
        socket.connect();
        socket.emit('join-room', { roomId, user, audioEnabled: true, videoEnabled: true });
      }
    };

    startConnection();

    

    // A. When we join, the server tells us who is already here. We send them an Offer.
    socket.on('all-users', (existingUsers) => {
      existingUsers.forEach(async (remoteUser) => {
        if (remoteUser.socketId === socket.id) return;
        const pc = createPeerConnection(remoteUser.socketId, remoteUser);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socket.emit('offer', {
          targetSocketId: remoteUser.socketId,
          callerSocketId: socket.id,
          sdp: offer,
          callerUser: { ...user, audioEnabled: true, videoEnabled: true }
        });
      });
    });

    // B. When a new user joins, they will send us an Offer. We receive it, save it, and send an Answer.
    socket.on('offer', async ({ callerSocketId, sdp, callerUser }) => {
      const pc = createPeerConnection(callerSocketId, callerUser);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socket.emit('answer', {
        targetSocketId: callerSocketId,
        responderSocketId: socket.id,
        sdp: answer
      });
    });

    // C. When the other user Answers our Offer, we finalize the connection.
    socket.on('answer', async ({ responderSocketId, sdp }) => {
      const pc = peersRef.current.get(responderSocketId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    // D. Exchange network routing info
    socket.on('ice-candidate', async ({ senderSocketId, candidate }) => {
      const pc = peersRef.current.get(senderSocketId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // E. Handle UI updates when people mute/turn off cameras
    socket.on('user-toggled-audio', ({ socketId, audioEnabled }) => {
      setRemoteUsers(prev => prev.map(u => u.socketId === socketId ? { ...u, audioEnabled } : u));
    });

    socket.on('user-toggled-video', ({ socketId, videoEnabled }) => {
      setRemoteUsers(prev => prev.map(u => u.socketId === socketId ? { ...u, videoEnabled } : u));
    });

    // F. Handle user leaving
    socket.on('user-left', ({ socketId }) => {
      const pc = peersRef.current.get(socketId);
      if (pc) {
        pc.close();
        peersRef.current.delete(socketId);
      }
      setRemoteUsers(prev => prev.filter(u => u.socketId !== socketId));
    });

    // G. Handle meeting forcefully ended by host
    socket.on('meeting-ended', ({ message }) => {
      toast.error(message || 'Meeting ended');
      if (onMeetingEnded) onMeetingEnded();
    });

   
    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      peersRef.current.forEach(pc => pc.close());
      peersRef.current.clear();
      
      socket.off('all-users');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-toggled-audio');
      socket.off('user-toggled-video');
      socket.off('user-left');
      socket.off('meeting-ended');
      socket.disconnect();
    };
  }, [roomId, initLocalStream, createPeerConnection]); 
 

  const toggleAudio = useCallback(() => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newState;
        socket.emit('toggle-audio', { roomId, audioEnabled: newState });
        toast(newState ? 'Microphone on' : 'Microphone muted', { icon: newState ? '🎙️' : '🔇' });
      }
    }
  }, [audioEnabled, roomId]);

  const toggleVideo = useCallback(() => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newState;
        socket.emit('toggle-video', { roomId, videoEnabled: newState });
        toast(newState ? 'Camera on' : 'Camera off', { icon: newState ? '📷' : '🚫' });
      }
    }
  }, [videoEnabled, roomId]);

  const endMeeting = useCallback(() => {
    if (onMeetingEnded) {
      socket.emit('end-meeting', { roomId });
      onMeetingEnded('meeting-ended');
    }
  }, [onMeetingEnded, roomId]);

  return { localStream, remoteUsers, audioEnabled, videoEnabled, toggleAudio, toggleVideo, endMeeting };
};