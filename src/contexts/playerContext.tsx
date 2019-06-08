import { createContext, h } from 'preact';
import { useState } from 'preact/hooks';
import AudioPlayer from '../components/audio-player';
import { Episode } from '../models';
import PodcastService from '../services/podcastService';

const podcastService = new PodcastService();

interface PlayerContextProps {
    episode: Episode | undefined;
    playing: boolean;
    progress: number;
    duration: number;
    setEpisode: (episode: Episode, resume?: boolean, play?: boolean) => void;
    setPlaying: (playing: boolean) => void;
    setProgress: (progress: number) => void;
    setDuration: (duration: number) => void;
    reset: () => void;
}
export const PlayerContext = createContext<PlayerContextProps>({} as any);

export function PlayerProvider({ children }: any) {
    const [episode, setEpisodeInternal] = useState<Episode | undefined>(undefined);
    const [playing, setPlayingInternal] = useState(false);
    const [progress, setProgressInternal] = useState(0);
    const [duration, setDurationInternal] = useState(0);

    const setEpisode = (newEpisode: Episode, resume = false, play = true) => {
        setEpisodeInternal(newEpisode);
        setProgressInternal(resume ? newEpisode.progress : 0);
        setPlayingInternal(play);
    };

    const setPlaying = (newPlaying: boolean) => {
        setPlayingInternal(newPlaying);
    };

    const setProgress = (newProgress: number) => {
        if (!episode) {
            return;
        }
        setProgressInternal(newProgress);
        podcastService.updateEpisode(episode.id, { progress: newProgress });
    };

    const setDuration = (newDuration: number) => {
        if (!episode) {
            return;
        }
        setDurationInternal(newDuration);
        podcastService.updateEpisode(episode.id, { duration: newDuration });
    };

    const reset = () => {
        setEpisodeInternal(undefined);
        setPlayingInternal(false);
        setProgressInternal(0);
        setDurationInternal(0);
    };

    return (
        <PlayerContext.Provider
            value={{
                episode,
                playing,
                progress,
                duration,
                setEpisode,
                setPlaying,
                setProgress,
                setDuration,
                reset
            }}
        >
            {children}
            <AudioPlayer />
        </PlayerContext.Provider>
    );
}
