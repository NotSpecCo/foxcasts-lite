import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { Podcast, Episode } from '../core/models';
import { ListItem, View } from '../ui-components';
import { NavItem, setSelected, wrapItems } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';
import {
  getEpisodesByPodcastId,
  getPodcastById,
  unsubscribe,
} from '../core/services/podcasts';

interface PodcastDetailProps {
  podcastId: string;
  selectedItemId?: string;
}
export default function PodcastDetail({
  podcastId,
  selectedItemId,
}: PodcastDetailProps): VNode {
  const [podcast, setPodcast] = useState<Podcast | undefined>();
  const [items, setItems] = useState<NavItem<Episode>[]>([]);

  useEffect(() => {
    getPodcastById(parseInt(podcastId, 10), true).then((result) =>
      setPodcast(result)
    );

    getEpisodesByPodcastId(parseInt(podcastId, 10)).then((episodes) =>
      setItems(wrapItems(episodes, 'id', true))
    );
  }, [podcastId]);

  // Restore scroll position
  useEffect(() => {
    if (!selectedItemId) return;

    const selected = items.find((a) => a.id === selectedItemId);
    if (selected && !selected.isSelected) {
      setItems(setSelected(items, selectedItemId));
    }
  }, [selectedItemId, items]);

  function viewEpisode(episode: Episode): void {
    route(`/episode/${episode.id}`);
  }

  useDpad({
    items,
    onEnter: (item) => viewEpisode(item.data),
    onChange: (items) => {
      const selected = items.find((a) => a.isSelected);
      if (selected) {
        route(`/podcast/${podcastId}?selectedItemId=${selected.id}`, true);
      } else {
        route(`/podcast/${podcastId}`, true);
      }
      setItems(items);
    },
    options: { stopPropagation: true },
  });

  async function handleAction(action: string): Promise<void> {
    if (action === 'unsubscribe' && podcast) {
      await unsubscribe(podcast.id)
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
      {items.map((item) => (
        <ListItem
          key={item.data.id}
          ref={item.ref}
          isSelected={item.isSelected}
          primaryText={item.data.title}
          secondaryText={new Date(item.data.date).toLocaleDateString()}
          shortcutKey={item.shortcutKey}
          onClick={(): void => viewEpisode(item.data)}
        />
      ))}
    </View>
  );
}
