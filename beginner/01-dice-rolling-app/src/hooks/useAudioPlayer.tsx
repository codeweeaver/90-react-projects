import { useMemo, useRef } from "react";

export default function useAudioPlayer(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current && typeof window !== "undefined") {
    audioRef.current = new Audio(src);
  }

  const controls = useMemo(() => {
    return {
      play: () => {
        audioRef.current?.play().catch(() => {
          console.log("failed to play audio");
        });
      },
      pause: () => audioRef.current?.pause(),
      reset: () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      },
    };
  }, []);

  return controls;
}
