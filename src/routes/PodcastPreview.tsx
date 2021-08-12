import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { RawPodcast } from '../core/models/RawPodcast';
import { ApiService } from '../core/services/apiService';
import {
  getPodcastByFeed,
  subscribe,
  unsubscribeByFeed,
} from '../core/services/podcasts';
import { ListItem, View } from '../ui-components';
import styles from './PodcastPreview.module.css';

const apiService = new ApiService();

interface PodcastPreviewProps {
  feedUrl: string;
}
export default function PodcastPreview({
  feedUrl,
}: PodcastPreviewProps): VNode {
  const [podcast, setPodcast] = useState<RawPodcast>();
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiService.getPodcastByFeed(feedUrl, 50).then((result) => {
      setPodcast(result);
      setLoading(false);
    });

    getPodcastByFeed(feedUrl).then((result) => setSubscribed(!!result));
  }, [feedUrl]);

  async function subscribeToPodcast(): Promise<void> {
    if (subscribing) {
      return;
    }
    setSubscribing(true);

    await subscribe(feedUrl, podcast)
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

    await unsubscribeByFeed(feedUrl)
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
        <div>{podcast?.summary}</div>
      </div>
      {loading ? <div className={styles.message}>Loading feed...</div> : null}
      {podcast?.episodes.slice(0, 10).map((episode) => (
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
