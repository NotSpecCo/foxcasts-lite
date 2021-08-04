import { h } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { Podcast, Episode } from '../core/models';
import { PodcastService } from '../core/services';
import { ListItem, View } from '../ui-components';
import { NavItem, wrapItems } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';

const podcastService = new PodcastService();

interface PodcastDetailProps {
  podcastId: string;
}
export default function PodcastDetail({ podcastId }: PodcastDetailProps): any {
  const [podcast, setPodcast] = useState<Podcast | undefined>();
  const [items, setItems] = useState<NavItem<Episode>[]>([]);

  useEffect(() => {
    podcastService.getById(parseInt(podcastId, 10), true).then((result) => {
      if (!result.episodes) {
        result.episodes = [];
      }
      setPodcast(result);
      setItems(wrapItems(result.episodes, true));
    });
  }, [podcastId]);

  function viewEpisode(episode: Episode): void {
    route(`/episode/${episode.id}`);
  }

  useDpad({
    items,
    onEnter: (item) => viewEpisode(item.data),
    onChange: (items) => setItems(items),
    options: { stopPropagation: true },
  });

  async function handleAction(action: string): Promise<void> {
    if (action === 'unsubscribe' && podcast) {
      await podcastService
        .unsubscribe(podcast.id)
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
          secondaryText={item.data.date.toLocaleDateString()}
          shortcutKey={item.shortcutKey}
          onClick={(): void => viewEpisode(item.data)}
        />
      ))}
    </View>
  );
}
