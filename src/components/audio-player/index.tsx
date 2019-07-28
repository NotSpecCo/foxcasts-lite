import { Episode } from 'foxcasts-core/models';
import { h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import ReactAudioPlayer from 'react-audio-player';
import { usePlayerActions, usePlayerState } from '../../hooks/usePlayer';

interface AudioPlayerProps {}

export default function AudioPlayer(props: AudioPlayerProps) {
    let audioRef: any;

    const [internalEpisode, setInternalEpisode] = useState<Episode | null>(null);

    const { episode, playing, progress, duration } = usePlayerState();
    const { setProgress, setDuration } = usePlayerActions();

    useEffect(() => {
        console.log('playerState changed', { episode, playing, progress });

        if (episode) {
            audioRef.audioEl.mozAudioChannelType = 'content';
            audioRef.audioEl.pause = () => console.log('fake pause');
            playing && audioRef.audioEl.play();
            // playing ? audioRef.audioEl.play() : audioRef.audioEl.pause();
        }

        const timeDiff = Math.abs(audioRef.audioEl.currentTime - progress);
        if (timeDiff > 2) {
            audioRef.audioEl.currentTime = progress;
        }
    }, [episode, progress, playing]);

    const handleProgressChanged = (newProgress: number) => {
        if (!episode) {
            return;
        }
        // console.log('progress changed', newProgress)
        setProgress(Math.ceil(newProgress));
    };

    const handleLoadedMetadata = (ev: any) => {
        if (!episode) {
            return;
        }
        audioRef.audioEl.currentTime = progress;
        setDuration(Math.ceil(ev.currentTarget.duration));
    };

    const handleEpisodeEnded = () => {
        if (!episode) {
            return;
        }
        setProgress(duration);
    };

    const handleError = (ev: any) => {
        console.log('handleError', ev);
    };

    const handlePause = () => {
        console.log('paused');
        if (playing) {
            console.log('force play');
            audioRef.audioEl.play();
        }
    };

    const isPaused = () => {};

    console.log('AudioPlayer rendered', { episode, playing, progress });
    // audioRef ? console.dir(audioRef.audioEl) : console.log('No audioRef');
    // if (audioRef && audioRef.audioEl && playing)
    return (
        <ReactAudioPlayer
            ref={(element: any) => (audioRef = element)}
            autoPlay={true}
            listenInterval={1000}
            onListen={handleProgressChanged}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEpisodeEnded}
            onError={handleError}
            onPause={handlePause}
            src={episode && episode.fileUrl}
        />
    );
}
