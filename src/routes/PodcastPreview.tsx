import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Podcast, Episode } from '../core/models';
import { ApiService, PodcastService } from '../core/services';
import { ListItem, View } from '../ui-components';
import styles from './PodcastPreview.module.css';

const apiService = new ApiService();
const podcastService = new PodcastService();

interface PodcastPreviewProps {
  podcastId: number;
}
export default function PodcastPreview({
  podcastId,
}: PodcastPreviewProps): any {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiService
      .getPodcastById(podcastId)
      .then((result) => {
        setPodcast(result);
        return result.feedUrl;
      })
      .then((feedUrl) => apiService.getEpisodes(feedUrl))
      .then((result) => {
        setEpisodes(result);
      })
      .then(() => setLoading(false));

    podcastService.getById(podcastId).then((result) => setSubscribed(!!result));
  }, [podcastId]);

  async function togggleSubscribe(): Promise<void> {
    if (subscribing) {
      return;
    }
    setSubscribing(true);

    try {
      subscribed
        ? await podcastService.unsubscribe(podcastId)
        : await podcastService.subscribe(podcastId);

      setSubscribed(!subscribed);
    } catch (err) {
      console.error(err);
    }

    setSubscribing(false);
  }

  function handleAction(action: string): void {
    if (action === 'subscribe' || action === 'unsubscribe') {
      togggleSubscribe();
    }
  }

  return (
    <View
      headerText={podcast?.title || ''}
      showHeader={false}
      centerMenuText=""
      rightMenuText="Actions"
      actions={[
        {
          id: subscribed ? 'unsubscribe' : 'subscribe',
          label: subscribing
            ? 'Working...'
            : subscribed
            ? 'Unsubscribe'
            : 'Subscribe',
        },
      ]}
      onAction={handleAction}
    >
      <div className={styles.details}>
        {podcast && (
          <img
            src={podcast.cover[600] || podcast.cover[100]}
            className={styles.logo}
          />
        )}
        <div className={styles.title}>{podcast?.title}</div>
        <div className={styles.author}>{podcast?.author}</div>
      </div>
      {episodes.map((episode) => (
        <ListItem
          key={episode.id}
          primaryText={episode.title}
          secondaryText={episode.date.toLocaleDateString()}
        />
      ))}
    </View>
  );
}
