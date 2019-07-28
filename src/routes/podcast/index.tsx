import { Episode, Podcast } from 'foxcasts-core/models';
import { PodcastService } from 'foxcasts-core/services';
import { h } from 'preact';
import { route } from 'preact-router';
import { useContext, useEffect, useState } from 'preact/hooks';
import AppContext from '../../contexts/appContext';
import { useNavKeys } from '../../hooks/useNavKeys';
import { useShortcutKeys } from '../../hooks/useShortcutKeys';
import * as style from './style.css';

const podcastService = new PodcastService();

interface PodcastDetailProps {
    podcastId: string;
}
export default function PodcastDetail({ podcastId }: PodcastDetailProps) {
    const [podcast, setPodcast] = useState<Podcast | null>(null);
    const { openNav } = useContext(AppContext);

    useNavKeys({
        SoftLeft: () => openNav()
    });

    useShortcutKeys(podcast ? podcast!.episodes! : [], {}, episode =>
        handleEpisodeClick(episode)()
    );

    useEffect(() => {
        podcastService.getPodcastById(parseInt(podcastId, 10), true).then(result => {
            if (!result.episodes) {
                result.episodes = [];
            }
            setPodcast(result);
        });
    }, [podcastId]);

    const handleEpisodeClick = (episode: Episode) => () => {
        route(`/episode/${episode.id}`);
    };

    if (!podcast) {
        return null;
    }

    return (
        <div class="view-container">
            <div class="kui-header">
                <h1 class="kui-h1">{podcast.title}</h1>
            </div>
            <div class="view-content">
                <ul class="kui-list">
                    {podcast.episodes!.map((episode: Episode) => (
                        <li key={episode.id} tabIndex={1} onClick={handleEpisodeClick(episode)}>
                            <div class="kui-list-cont">
                                <p className={`kui-pri ${style.episodeTitle}`}>{episode.title}</p>
                                <p class="kui-sec">{episode.date.toLocaleString()}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div class="kui-software-key bottom">
                <h5 class="kui-h5">Nav</h5>
                <h5 class="kui-h5">SELECT</h5>
                <h5 class="kui-h5" />
            </div>
        </div>
    );
}
