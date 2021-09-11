import { createContext, h, VNode } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { EpisodeExtended } from '../core/models';
import { getEpisodeById } from '../core/services/podcasts';
import { ComponentBaseProps } from '../models';

export type PlaybackStatus = {
  playing: boolean;
  currentTime: number;
  duration: number;
};

type PlayerContextValue = {
  episode?: EpisodeExtended;
  load: (episodeId: number, resume?: boolean) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  jump: (seconds: number) => void;
  goTo: (seconds: number) => void;
  getStatus: () => PlaybackStatus;
  audioRef: HTMLAudioElement;
  playing: boolean;
};

const defaulValue: PlayerContextValue = {
  load: () => console.log('load'),
  play: () => console.log('play'),
  pause: () => console.log('pause'),
  stop: () => console.log('stop'),
  jump: () => console.log('jump'),
  goTo: () => console.log('goTo'),
  getStatus: () => ({
    playing: false,
    currentTime: 0,
    duration: 0,
  }),
  audioRef: new Audio(),
  playing: false,
};
export const PlayerContext = createContext<PlayerContextValue>(defaulValue);

export function PlayerProvider(props: ComponentBaseProps): VNode {
  const [episode, setEpisode] = useState<EpisodeExtended>();
  const [playing, setPlaying] = useState(false);
  const [audioRef] = useState<HTMLAudioElement>(new Audio());

  async function load(episodeId: number, resume = false): Promise<void> {
    const data = await getEpisodeById(episodeId);

    if (!data) return;

    setEpisode(data);

    (audioRef as any).mozAudioChannelType = 'content';
    audioRef.src = data.fileUrl;
    audioRef.currentTime = 0;
    audioRef.play();
    setPlaying(true);
  }

  function play(): void {
    audioRef.play();
    setPlaying(true);
  }

  function pause(): void {
    audioRef.pause();
    setPlaying(false);
  }

  function stop(): void {
    setEpisode(undefined);
    audioRef.src = '';
    audioRef.currentTime = 0;
    setPlaying(false);
  }

  function jump(seconds: number): void {
    const newTime = audioRef.currentTime + seconds;
    audioRef.currentTime = newTime;
  }

  function goTo(seconds: number): void {
    audioRef.currentTime = seconds;
  }

  function getStatus(): PlaybackStatus {
    return {
      playing: !audioRef.paused,
      currentTime: Math.ceil(audioRef.currentTime),
      duration: Math.ceil(audioRef.duration),
    };
  }

  return (
    <PlayerContext.Provider
      value={{
        episode,
        load,
        play,
        pause,
        stop,
        jump,
        goTo,
        getStatus,
        audioRef,
        playing,
      }}
    >
      {props.children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
