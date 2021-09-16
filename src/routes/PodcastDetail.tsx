import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { ListItem, View } from '../ui-components';
import { setSelected } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';
import { Episode, Podcast } from 'foxcasts-core/lib/types';
import { Core } from '../services/core';

interface PodcastDetailProps {
  podcastId: string;
  selectedItemId?: string;
}
export default function PodcastDetail({
  podcastId,
  selectedItemId,
}: PodcastDetailProps): VNode {
  const [podcast, setPodcast] = useState<Podcast | undefined>();
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    Core.getPodcastById(parseInt(podcastId, 10)).then((result) =>
      setPodcast(result)
    );

    Core.getEpisodesByPodcastId(parseInt(podcastId, 10)).then((result) =>
      setEpisodes(result)
    );
  }, [podcastId]);

  // Restore scroll position
  useEffect(() => {
    if (!selectedItemId) return;
    setSelected(selectedItemId, true);
  }, [selectedItemId, episodes]);

  function viewEpisode(episodeId: string | number): void {
    route(`/episode/${episodeId}`);
  }

  useDpad({
    onEnter: (itemId) => viewEpisode(itemId),
    onChange: (itemId) => {
      if (itemId) {
        route(`/podcast/${podcastId}?selectedItemId=${itemId}`, true);
      } else {
        route(`/podcast/${podcastId}`, true);
      }
    },
  });

  async function handleAction(action: string): Promise<void> {
    if (action === 'unsubscribe' && podcast) {
      await Core.unsubscribe(podcast.id)
        .then(() => route('/podcasts', true))
        .catch((err) => console.error('Failed to unsubscribe', err));
    }
  }

  return (
    <View
      headerText={podcast?.title}
      actions={[{ id: 'unsubscribe', label: 'Unsubscribe' }]}
      onAction={handleAction}
    >
      {episodes.map((episode, i) => (
        <ListItem
          key={episode.id}
          itemId={episode.id}
          primaryText={episode.title}
          secondaryText={new Date(episode.date).toLocaleDateString()}
          shortcutKey={i + 1}
          onClick={(): void => viewEpisode(episode.id)}
        />
      ))}
    </View>
  );
}
