import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ApiEpisode, ApiPodcast } from '../core/models';
import api from '../core/services/api';
import {
  getPodcastByFeed,
  getPodcastByPodexId,
  subscribeByFeed,
  subscribeByPodexId,
  unsubscribeByFeed,
  unsubscribeByPodexId,
} from '../core/services/podcasts';
import { ListItem, View } from '../ui-components';
import styles from './PodcastPreview.module.css';

interface PodcastPreviewProps {
  podexId?: string;
  feedUrl?: string;
}
export default function PodcastPreview({
  podexId,
  feedUrl,
}: PodcastPreviewProps): VNode {
  const [podcast, setPodcast] = useState<ApiPodcast>();
  const [episodes, setEpisodes] = useState<ApiEpisode[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.getPodcast(podexId ? parseInt(podexId, 10) : null, feedUrl),
      api.getEpisodes(podexId ? parseInt(podexId, 10) : null, feedUrl, 20),
    ]).then(([apiPodcast, apiEpisodes]) => {
      setPodcast(apiPodcast);
      setEpisodes(apiEpisodes);
      setLoading(false);
    });

    if (podexId) {
      getPodcastByPodexId(parseInt(podexId, 10)).then((result) =>
        setSubscribed(!!result)
      );
    } else if (feedUrl) {
      getPodcastByFeed(feedUrl).then((result) => setSubscribed(!!result));
    }
  }, [podexId, feedUrl]);

  async function subscribeToPodcast(): Promise<void> {
    if (subscribing) {
      return;
    }
    setSubscribing(true);

    if (podexId) {
      await subscribeByPodexId(parseInt(podexId, 10))
        .then(() => setSubscribed(true))
        .catch((err) =>
          console.error('Failed to subscribe to podcast', err.message)
        );
    } else if (feedUrl) {
      await subscribeByFeed(feedUrl)
        .then(() => setSubscribed(true))
        .catch((err) =>
          console.error('Failed to subscribe to podcast', err.message)
        );
    }

    setSubscribing(false);
  }

  async function unsubscribeFromPodcast(): Promise<void> {
    if (subscribing) {
      return;
    }
    setSubscribing(true);

    if (podexId) {
      await unsubscribeByPodexId(parseInt(podexId, 10))
        .then(() => setSubscribed(false))
        .catch((err) =>
          console.error('Failed to unsubscribe from podcast', err.message)
        );
    } else if (feedUrl) {
      await unsubscribeByFeed(feedUrl)
        .then(() => setSubscribed(false))
        .catch((err) =>
          console.error('Failed to unsubscribe from podcast', err.message)
        );
    }

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
      headerText="Feed Preview"
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
        <div className={styles.title}>{podcast?.title}</div>
        <div className={styles.author}>{podcast?.author}</div>
        <div>{podcast?.description}</div>
      </div>
      {loading ? <div className={styles.message}>Loading feed...</div> : null}
      {episodes.map((episode) => (
        <ListItem
          key={episode.fileUrl}
          itemId={episode.fileUrl}
          primaryText={episode.title}
          secondaryText={new Date(episode.date).toLocaleDateString()}
        />
      ))}
    </View>
  );
}
