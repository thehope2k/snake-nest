import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client'
import { Camera, CameraOff, Mic, MicOff, VideoOff } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogTrigger, IconButton } from '@/components/ui'
import { useMeetCall } from '@/lib/meet-call'

interface PreJoinDialogProps {
  nestId: string
  nestName: string
  trigger: ReactNode
}

// A Teams/Meet-style "check yourself before you join" step -- the camera preview is a
// real local track (not just a <video> hooked to getUserMedia) so it can be published
// directly on join instead of re-requesting the camera, which would flicker it off/on.
export function PreJoinDialog({ nestId, nestName, trigger }: PreJoinDialogProps) {
  const [open, setOpen] = useState(false)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null)
  const [joining, setJoining] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { joinCall } = useMeetCall()

  useEffect(() => {
    if (!open || !cameraEnabled) return
    let cancelled = false
    createLocalVideoTrack()
      .then((track) => {
        if (cancelled) {
          track.stop()
          return
        }
        setVideoTrack(track)
      })
      .catch(() => setCameraEnabled(false))

    return () => {
      cancelled = true
    }
  }, [open, cameraEnabled])

  useEffect(() => {
    if (!videoTrack) return
    if (videoRef.current) videoTrack.attach(videoRef.current)
    return () => {
      videoTrack.detach()
    }
  }, [videoTrack])

  function stopPreview() {
    videoTrack?.stop()
    setVideoTrack(null)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      stopPreview()
      setCameraEnabled(false)
      setMicEnabled(true)
    }
  }

  function toggleCamera() {
    if (cameraEnabled) stopPreview()
    setCameraEnabled((value) => !value)
  }

  async function handleJoin() {
    setJoining(true)
    try {
      await joinCall(nestId, { microphoneEnabled: micEnabled, cameraEnabled, previewVideoTrack: videoTrack })
      // Ownership of videoTrack (if any) passed to the room on a successful publish --
      // don't stop it here, just clear local state without touching the track itself.
      setVideoTrack(null)
      setOpen(false)
    } finally {
      setJoining(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={`Join call in ${nestName}`} size="md">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-elevated-2">
          {cameraEnabled && videoTrack ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-fg-subtle">
              <VideoOff size={28} />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <IconButton
            aria-label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
            size="lg"
            className="rounded-full"
            onClick={() => setMicEnabled((value) => !value)}
          >
            {micEnabled ? <Mic size={18} /> : <MicOff size={18} className="text-doghouse" />}
          </IconButton>
          <IconButton
            aria-label={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            size="lg"
            className="rounded-full"
            onClick={toggleCamera}
          >
            {cameraEnabled ? <Camera size={18} /> : <CameraOff size={18} className="text-fg-subtle" />}
          </IconButton>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleJoin} disabled={joining}>
            {joining ? 'Joining...' : 'Join now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
