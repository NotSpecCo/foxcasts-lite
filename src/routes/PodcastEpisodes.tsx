import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { format } from 'date-fns';
import { useEffect, useState } from 'preact/hooks';
import { SelectablePriority } from '../hooks/useDpad';
import { Artwork, Episode, Podcast } from 'foxcasts-core/lib/types';
import { Core } from '../services/core';
import { AppBar } from '../ui-components2/appbar';
import { List, ListItem } from '../ui-components2/list';
import {
  View,
  ViewTabs,
  ViewContent,
  ViewHeader,
} from '../ui-components2/view';
import { useListNav } from '../hooks/useListNav';

interface PodcastDetailProps {
  podcastId: string;
  selectedItemId?: string;
}

export default function PodcastEpisodes({
  podcastId,
  selectedItemId,
}: PodcastDetailProps): VNode {
  const [podcast, setPodcast] = useState<Podcast>();
  const [episodes, setEpisodes] = useState<Episode[]>();
  const [artwork, setArtwork] = useState<Artwork>();

  useEffect(() => {
    console.time('get artwork');
    Core.getArtwork(podcastId, { size: 320, blur: 5 }).then((res) => {
      console.log('res', res);
      console.timeEnd('get artwork');
      setArtwork(res);
    });
  }, []);

  useEffect(() => {
    Core.getEpisodesByPodcastId(parseInt(podcastId, 10)).then((result) => {
      setEpisodes(result);
    });
    Core.getPodcastById(parseInt(podcastId, 10)).then((result) =>
      setPodcast(result)
    );
  }, [podcastId]);

  useListNav({
    priority: SelectablePriority.Low,
    initialSelectedId: episodes ? selectedItemId : undefined,
    updateRouteOnChange: true,
    onSelect: (id) => route(`/episode/${id}`),
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
      backgroundImageUrl={artwork?.image}
      accentColor={artwork?.palette?.vibrant}
    >
      <ViewHeader>{podcast?.title}</ViewHeader>
      <ViewTabs
        tabs={[
          { id: 'episodes', label: 'episodes' },
          { id: 'info', label: 'podcast' },
        ]}
        selectedId="episodes"
        onChange={(tabId): boolean =>
          route(`/podcast/${podcastId}/${tabId}`, true)
        }
      />
      <ViewContent>
        <List>
          {episodes?.map((episode, i) => (
            <ListItem
              key={episode.id}
              selectable={{
                id: episode.id,
                shortcut: i + 1 <= 9 ? i + 1 : undefined,
                selected: episode.id.toString() === selectedItemId,
              }}
              primaryText={episode.title}
              secondaryText={format(new Date(episode.date), 'cccc, MMMM co')}
            />
          ))}
        </List>
      </ViewContent>
      <AppBar
        centerText="Select"
        actions={[{ id: 'unsubscribe', label: 'Unsubscribe' }]}
        onAction={handleAction}
      />
    </View>
  );
}
