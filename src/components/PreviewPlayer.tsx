import { useEffect, useRef } from 'react';

export interface PreviewPlayerProperties {
  activeId: string | null;
  id: string;
  onPlay: (id: string) => void;
  url: string;
}

// 1. Child Component: Individual Player
export default function PreviewPlayer({
  id,
  url,
  activeId,
  onPlay,
}: PreviewPlayerProperties) {
  const audioReference = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // If a different audio ID is active, pause this player
    if (activeId !== id && audioReference.current) {
      audioReference.current.pause();
      // Optional: Reset time to 0 if you want them to restart on next play
      // audioRef.current.currentTime = 0;
    }
  }, [activeId, id]);

  return (
    <div className="track-player mt-3">
      <audio
        ref={audioReference}
        controls
        controlsList="nodownload"
        src={url}
        // Critical: Notify parent when this specific player starts
        onPlay={() => onPlay(id)}
      />
    </div>
  );
}
