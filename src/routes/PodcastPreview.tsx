import { ApiEpisode, ApiPodcast } from 'foxcasts-core/lib/types';
import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useBodyScroller } from '../hooks/useBodyScroller';
import { Core, subscribe } from '../services/core';
import { AppBar } from '../ui-components/appbar';
import { ListItem } from '../ui-components/list';
import { Typography } from '../ui-components/Typography';
import { View, ViewContent } from '../ui-components/view';

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

    Core.getPodcast({ podexId: Number(podexId), feedUrl }).then((result) =>
      setSubscribed(!!result)
    );
  }, [podexId, feedUrl]);

  useBodyScroller({});

  async function subscribeToPodcast(): Promise<void> {
    const id = await subscribe({ podexId: Number(podexId), feedUrl });
    if (id) {
      setSubscribed(true);
    }
  }

  async function unsubscribeFromPodcast(): Promise<void> {
    await Core.unsubscribe({ podexId: Number(podexId), feedUrl })
      .then(() => setSubscribed(false))
      .catch((err) =>
        console.error('Failed to unsubscribe from podcast', err.message)
      );
  }

  return (
    <View>
      <ViewContent>
        {loading ? <Typography>Loading feed...</Typography> : null}
        <Typography type="title">{podcast?.title}</Typography>
        <Typography color="accent" padding="horizontal">
          {podcast?.author}
        </Typography>
        <Typography>{podcast?.description}</Typography>
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
            id: 'toggleSubscribe',
            label: subscribed ? 'Unsubscribe' : 'Subscribe',
            actionFn: subscribed ? unsubscribeFromPodcast : subscribeToPodcast,
          },
        ]}
      />
    </View>
  );
}
