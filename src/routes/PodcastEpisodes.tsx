import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { format } from 'date-fns';
import { useEffect, useState } from 'preact/hooks';
import { SelectablePriority } from '../hooks/useDpad';
import { Episode, Podcast } from 'foxcasts-core/lib/types';
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
import { useArtwork } from '../hooks/useArtwork';
import { ArtworkSize } from '../enums/artworkSize';
import { ArtworkBlur } from '../enums/artworkBlur';
import { usePodcastSettings } from '../hooks/usePodcastSettings';
import { useSettings } from '../contexts/SettingsProvider';

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

  const { artwork } = useArtwork(podcastId, {
    size: ArtworkSize.Large,
    blur: ArtworkBlur.Some,
  });
  const { settings } = useSettings();
  const { settings: podcastSettings, setSetting } =
    usePodcastSettings(podcastId);

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
      accentColor={artwork?.palette?.[podcastSettings.accentColor]}
      enableCustomColor={true}
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
              secondaryText={format(new Date(episode.date), 'cccc, MMMM do')}
            />
          ))}
        </List>
      </ViewContent>
      <AppBar
        centerText="Select"
        options={
          settings.dynamicThemeColor
            ? [
                {
                  id: 'accentColor',
                  label: 'Accent Color',
                  currentValue: podcastSettings.accentColor,
                  options: [
                    { id: 'darkMuted', label: 'Dark Muted' },
                    { id: 'darkVibrant', label: 'Dark Vibrant' },
                    { id: 'lightMuted', label: 'Light Muted' },
                    { id: 'lightVibrant', label: 'Light Vibrant' },
                    { id: 'muted', label: 'Muted' },
                    { id: 'vibrant', label: 'Vibrant' },
                  ],
                },
              ]
            : []
        }
        actions={[{ id: 'unsubscribe', label: 'Unsubscribe' }]}
        onAction={handleAction}
        onOptionChange={setSetting}
      />
    </View>
  );
}
