import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Episode, ITunesPodcast, RawEpisode } from '../core/models';
import { ApiService } from '../core/services/apiService';
import {
  getPodcastById,
  getPodcastByStoreId,
  subscribe,
  unsubscribe,
} from '../core/services/podcasts';
import { ListItem, View } from '../ui-components';
import styles from './PodcastPreview.module.css';

const apiService = new ApiService();

interface PodcastPreviewProps {
  podcastStoreId: string;
}
export default function PodcastPreview({
  podcastStoreId,
}: PodcastPreviewProps): VNode {
  const [podcast, setPodcast] = useState<ITunesPodcast>();
  const [episodes, setEpisodes] = useState<RawEpisode[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiService
      .getPodcastById(parseInt(podcastStoreId, 10))
      .then((result) => {
        setPodcast(result);
        return result.feedUrl;
      })
      .then((feedUrl) => apiService.getEpisodes(feedUrl, { numResults: 10 }))
      .then((result) => {
        setEpisodes(result);
        setLoading(false);
      });

    getPodcastByStoreId(parseInt(podcastStoreId, 10)).then((result) =>
      setSubscribed(!!result)
    );
  }, [podcastStoreId]);

  async function subscribeToPodcast(): Promise<void> {
    if (subscribing) {
      return;
    }
    setSubscribing(true);

    await subscribe(parseInt(podcastStoreId, 10))
      .then(() => setSubscribed(true))
      .catch((err) =>
        console.error('Failed to subscribe to podcast', err.message)
      );

    setSubscribing(false);
  }

  async function unsubscribeFromPodcast(): Promise<void> {
    if (subscribing) {
      return;
    }
    setSubscribing(true);

    await unsubscribe(parseInt(podcastStoreId, 10), 'store')
      .then(() => setSubscribed(false))

      .catch((err) =>
        console.error('Failed to unsubscribe from podcast', err.message)
      );

    setSubscribing(false);
  }

  function handleAction(action: string): void {
    switch (action) {
      case 'subscribe':
        subscribeToPodcast();
        break;
      case 'unsubscribe':
        unsubscribeFromPodcast();
        break;
    }
  }

  return (
    <View
      showHeader={false}
      centerMenuText=""
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
            src={podcast.artworkUrl600 || podcast.artworkUrl100}
            className={styles.logo}
          />
        )}
        <div className={styles.title}>{podcast?.collectionName}</div>
        <div className={styles.author}>{podcast?.artistName}</div>
      </div>
      {episodes.map((episode) => (
        <ListItem
          key={episode.guid}
          itemId={episode.guid}
          primaryText={episode.title}
          secondaryText={new Date(episode.date).toLocaleDateString()}
        />
      ))}
    </View>
  );
}
