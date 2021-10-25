import { ApiEpisode, ApiPodcast } from 'foxcasts-core/lib/types';
import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useBodyScroller } from '../hooks/useBodyScroller';
import { Core, subscribeByFeed, subscribeByPodexId } from '../services/core';
import { AppBar } from '../ui-components2/appbar';
import { ListItem } from '../ui-components2/list';
import { View, ViewContent } from '../ui-components2/view';
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
      Core.fetchPodcast(podexId ? parseInt(podexId, 10) : null, feedUrl),
      Core.fetchEpisodes(podexId ? parseInt(podexId, 10) : null, feedUrl, 20),
    ]).then(([apiPodcast, apiEpisodes]) => {
      setPodcast(apiPodcast);
      setEpisodes(apiEpisodes);
      setLoading(false);
    });

    if (podexId) {
      Core.getPodcastByPodexId(parseInt(podexId, 10)).then((result) =>
        setSubscribed(!!result)
      );
    } else if (feedUrl) {
      Core.getPodcastByFeedUrl(feedUrl).then((result) =>
        setSubscribed(!!result)
      );
    }
  }, [podexId, feedUrl]);

  useBodyScroller({});

  async function subscribeToPodcast(): Promise<void> {
    if (subscribing) {
      return;
    }
    setSubscribing(true);

    podexId
      ? await subscribeByPodexId(podexId)
      : feedUrl
      ? await subscribeByFeed(feedUrl)
      : null;

    setSubscribing(false);
  }

  async function unsubscribeFromPodcast(): Promise<void> {
    if (subscribing) {
      return;
    }
    setSubscribing(true);

    if (podexId) {
      await Core.unsubscribeByPodexId(parseInt(podexId, 10))
        .then(() => setSubscribed(false))
        .catch((err) =>
          console.error('Failed to unsubscribe from podcast', err.message)
        );
    } else if (feedUrl) {
      await Core.unsubscribeByFeedUrl(feedUrl)
        .then(() => setSubscribed(false))
        .catch((err) =>
          console.error('Failed to unsubscribe from podcast', err.message)
        );
    }

    setSubscribing(false);
  }

  async function handleAction(action: string): Promise<void> {
    switch (action) {
      case 'subscribe':
        await subscribeToPodcast();
        break;
      case 'unsubscribe':
        await unsubscribeFromPodcast();
        break;
    }
  }

  return (
    <View>
      <ViewContent>
        <div className={styles.details}>
          <div className={styles.title}>{podcast?.title}</div>
          <div className={styles.author}>{podcast?.author}</div>
          <div>{podcast?.description}</div>
        </div>
        {loading ? <div className={styles.message}>Loading feed...</div> : null}
        {episodes.map((episode) => (
          <ListItem
            key={episode.fileUrl}
            primaryText={episode.title}
            secondaryText={new Date(episode.date).toLocaleDateString()}
          />
        ))}
      </ViewContent>
      <AppBar
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
      />
    </View>
  );
}
