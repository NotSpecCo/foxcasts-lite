import { createContext, h } from 'preact';
import { useState } from 'preact/hooks';
import AudioPlayer from '../components/audio-player';
import { Episode } from '../models';
import PodcastService from '../services/podcastService';

const podcastService = new PodcastService();

interface PlayerStateContextProps {
    episode: Episode | undefined;
    playing: boolean;
    progress: number;
    duration: number;
}

interface PlayerActionsContextProps {
    setEpisode: (episode: Episode, resume?: boolean, play?: boolean) => void;
    setPlaying: (playing: boolean) => void;
    setProgress: (progress: number) => void;
    setDuration: (duration: number) => void;
    reset: () => void;
}
export const PlayerStateContext = createContext<PlayerStateContextProps>({} as any);
export const PlayerActionsContext = createContext<PlayerActionsContextProps>({} as any);

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
        <PlayerStateContext.Provider
            value={{
                episode,
                playing,
                progress,
                duration
            }}
        >
            <PlayerActionsContext.Provider
                value={{
                    setEpisode,
                    setPlaying,
                    setProgress,
                    setDuration,
                    reset
                }}
            >
                {children}
                <AudioPlayer />
            </PlayerActionsContext.Provider>
        </PlayerStateContext.Provider>
    );
}
