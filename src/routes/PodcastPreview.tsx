import { ApiEpisode, ApiPodcast } from 'foxcasts-core/lib/types';
import { AppBar } from 'mai-ui/dist/components/appbar';
import { ListItem } from 'mai-ui/dist/components/list';
import { Typography } from 'mai-ui/dist/components/Typography';
import { View, ViewContent } from 'mai-ui/dist/components/view';
import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import { useBodyScroller } from '../hooks/useBodyScroller';
import { Core, subscribe } from '../services/core';

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
      Core.podcasts.fetch(podexId ? parseInt(podexId, 10) : null, feedUrl),
      Core.episodes.fetch(podexId ? parseInt(podexId, 10) : null, feedUrl, 20),
    ]).then(([apiPodcast, apiEpisodes]) => {
      setPodcast(apiPodcast);
      setEpisodes(apiEpisodes);
      setLoading(false);
    });

    Core.podcasts
      .query({ podexId: Number(podexId), feedUrl })
      .then((result) => setSubscribed(!!result));
  }, [podexId, feedUrl]);

  useBodyScroller({});

  async function subscribeToPodcast(): Promise<void> {
    const id = await subscribe({ podexId: Number(podexId), feedUrl });
    if (id) {
      setSubscribed(true);
    }
  }

  async function unsubscribeFromPodcast(): Promise<void> {
    await Core.podcasts
      .unsubscribe({ podexId: Number(podexId), feedUrl })
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
        appMenuContent={<FoxcastsAppMenu />}
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
