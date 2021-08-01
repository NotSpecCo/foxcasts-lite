import { createContext, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { EpisodeExtended } from '../core/models';
import { EpisodeService } from '../core/services';

const episodeService = new EpisodeService();

interface PlayerStateContextProps {
  episode: EpisodeExtended | undefined;
  playing: boolean;
  progress: number;
  duration: number;
}

interface PlayerActionsContextProps {
  setEpisode: (
    episode: EpisodeExtended | null,
    resume?: boolean,
    play?: boolean
  ) => void;
  setPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}
export const PlayerStateContext = createContext<PlayerStateContextProps>(
  {} as any
);
export const PlayerActionsContext = createContext<PlayerActionsContextProps>(
  {} as any
);

export function PlayerProvider({ children }: any) {
  const [episode, setEpisodeInternal] = useState<EpisodeExtended | undefined>(
    undefined
  );
  const [playing, setPlayingInternal] = useState(false);
  const [progress, setProgressInternal] = useState(0);
  const [duration, setDurationInternal] = useState(0);

  const { current: audioEl } = useRef(new Audio());

  useEffect(() => {
    (audioEl as any).mozAudioChannelType = 'content';
    audioEl.onerror = (ev: any) => {
      console.error('audio error', ev);
    };
    audioEl.onloadeddata = (ev: any) => {
      setDuration(Math.ceil(ev.currentTarget.duration));
    };
    audioEl.onended = (ev: any) => {
      setEpisode(null);
    };
    audioEl.ontimeupdate = (ev: any) => {
      const newProgress = parseInt(ev.currentTarget.currentTime, 10);
      if (newProgress !== progress) {
        setProgressInternal(newProgress);
      }
    };

    if (episode) {
      episodeService.updateEpisode(episode!.id, { progress });
    }
  }, [progress, episode]);

  const setEpisode = (
    newEpisode: EpisodeExtended | null,
    resume = false,
    play = true
  ) => {
    if (!newEpisode) {
      audioEl.src = '';
      audioEl.currentTime = 0;
      setEpisodeInternal(undefined);
      return;
    }

    audioEl.src = newEpisode.fileUrl;
    audioEl.currentTime = resume ? newEpisode.progress : 0;

    if (play) {
      audioEl.play();
    }

    setEpisodeInternal(newEpisode);
    setProgressInternal(resume ? newEpisode.progress : 0);
    setPlayingInternal(play);
  };

  const setPlaying = (newPlaying: boolean) => {
    newPlaying ? audioEl.play() : audioEl.pause();
    setPlayingInternal(newPlaying);
  };

  const setProgress = (newProgress: number) => {
    const timeDiff = Math.abs(progress - newProgress);
    if (timeDiff > 2) {
      audioEl.currentTime = newProgress;
    }
  };

  const setDuration = (newDuration: number) => {
    if (!episode) {
      return;
    }
    setDurationInternal(newDuration);
    episodeService.updateEpisode(episode.id, { duration: newDuration });
  };

  const reset = () => {
    setEpisodeInternal(undefined);
    setPlayingInternal(false);
    setProgressInternal(0);
    setDurationInternal(0);
  };

  return (
    <PlayerStateContext.Provider
      value={{
        episode,
        playing,
        progress,
        duration,
      }}
    >
      <PlayerActionsContext.Provider
        value={{
          setEpisode,
          setPlaying,
          setProgress,
          setDuration,
          reset,
        }}
      >
        {children}
      </PlayerActionsContext.Provider>
    </PlayerStateContext.Provider>
  );
}
