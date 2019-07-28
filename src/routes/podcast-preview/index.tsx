import { Episode, Podcast } from 'foxcasts-core/models';
import { ApiService, PodcastService } from 'foxcasts-core/services';
import { h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import AppContext from '../../contexts/appContext';
import { useNavKeys } from '../../hooks/useNavKeys';

const apiService = new ApiService();
const podcastService = new PodcastService();

interface PodcastPreviewProps {
    podcastId: number;
}
export default function PodcastPreview({ podcastId }: PodcastPreviewProps) {
    const [podcast, setPodcast] = useState<Podcast | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [subscribed, setSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [loading, setLoading] = useState(true);

    const { openNav } = useContext(AppContext);

    useNavKeys({
        SoftLeft: () => openNav(),
        SoftRight: () => togggleSubscribe()
    });

    useEffect(() => {
        setLoading(true);
        apiService
            .getPodcastById(podcastId)
            .then(result => {
                setPodcast(result);
                return result.feedUrl;
            })
            .then(feedUrl => apiService.getEpisodes(feedUrl))
            .then(result => {
                console.log('component episodes', result);
                setEpisodes(result);
            })
            .then(() => setLoading(false));

        podcastService.getPodcastById(podcastId).then(result => setSubscribed(!!result));
    }, [podcastId]);

    const togggleSubscribe = async () => {
        if (subscribing) {
            return;
        }
        setSubscribing(true);

        try {
            subscribed
                ? await podcastService.unsubscribe(podcastId)
                : await podcastService.subscribe(podcastId);

            setSubscribed(!subscribed);
        } catch (err) {}

        setSubscribing(false);
    };

    if (!podcast || episodes.length === 0) {
        return (
            <div>
                <div class="kui-header">
                    <h1 class="kui-h1">Podcast Preview</h1>
                </div>
                <div class="content-area">
                    <p class="kui-text">{loading ? 'Loading...' : 'No podcast found!'}</p>
                </div>
            </div>
        );
    }

    return (
        <div class="view-container">
            <div class="kui-header">
                <h1 class="kui-h1">{podcast.title}</h1>
            </div>
            <div class="view-content">
                <ul class="kui-list">
                    {episodes.map(episode => (
                        <li key={episode.id} tabIndex={1}>
                            <div class="kui-list-cont">
                                <p class="kui-pri no-wrap">{episode.title}</p>
                                <p class="kui-sec">{episode.date.toLocaleString()}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div class="kui-software-key bottom">
                <h5 class="kui-h5">Nav</h5>
                <h5 class="kui-h5" />
                <h5 className={`kui-h5 ${subscribing ? 'disabled' : ''}`}>
                    {subscribed ? 'Unsubscribe' : 'Subscribe'}
                </h5>
            </div>
        </div>
    );
}
