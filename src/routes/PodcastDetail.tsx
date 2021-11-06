import { format } from 'date-fns';
import { Episode, Palette, Podcast } from 'foxcasts-core/lib/types';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { useSettings } from '../contexts/SettingsProvider';
import { SelectablePriority } from '../enums';
import { ArtworkBlur } from '../enums/artworkBlur';
import { ArtworkSize } from '../enums/artworkSize';
import { useArtwork } from '../hooks/useArtwork';
import { useListNav } from '../hooks/useListNav';
import { usePodcastSettings } from '../hooks/usePodcastSettings';
import { Core, refreshArtwork } from '../services/core';
import { AppBar } from '../ui-components/appbar';
import { List, ListItem } from '../ui-components/list';
import { Typography } from '../ui-components/Typography';
import { View, ViewHeader, ViewTab, ViewTabBar } from '../ui-components/view';

interface PodcastDetailProps {
  podcastId: string;
  tabId: 'episodes' | 'info';
  selectedItemId?: string;
}

export default function PodcastDetail({
  podcastId,
  tabId,
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
    Core.episodes
      .queryAll({
        podcastIds: [Number(podcastId)],
        offset: 0,
        limit: 25,
      })
      .then((result) => {
        setEpisodes(result);
      });
    Core.podcasts
      .query({ id: Number(podcastId) })
      .then((result) => setPodcast(result));
  }, [podcastId]);

  useListNav({
    priority: SelectablePriority.Low,
    initialSelectedId: episodes ? selectedItemId : undefined,
    updateRouteOnChange: true,
    onSelect: (id) => route(`/episode/${id}/info`),
  });

  return (
    <View
      backgroundImageUrl={artwork?.image}
      accentColor={podcast?.accentColor}
      enableCustomColor={true}
    >
      <ViewHeader>{podcast?.title}</ViewHeader>
      <ViewTabBar
        tabs={[
          { id: 'episodes', label: 'episodes' },
          { id: 'info', label: 'podcast' },
        ]}
        selectedId={tabId}
        onChange={(tabId) => route(`/podcast/${podcastId}/${tabId}`, true)}
      />
      <ViewTab tabId="episodes" activeTabId={tabId}>
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
      </ViewTab>
      <ViewTab tabId="info" activeTabId={tabId}>
        <Typography type="title" padding="horizontal">
          {podcast?.title}
        </Typography>
        <Typography padding="horizontal" color="accent">
          {podcast?.author}
        </Typography>
        <Typography>{podcast?.description}</Typography>
      </ViewTab>
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
        actions={[
          {
            id: 'unsubscribe',
            label: 'Unsubscribe',
            actionFn: (): Promise<boolean> =>
              Core.podcasts
                .unsubscribe({ id: Number(podcastId) })
                .then(() => route('/podcasts', true)),
          },
          {
            id: 'refreshArtwork',
            label: 'Refresh Artwork',
            actionFn: (): Promise<void> => refreshArtwork(Number(podcastId)),
          },
        ]}
        onOptionChange={async (id, value) => {
          setSetting(id, value);
          const accentColor = podcast?.palette?.[value as keyof Palette];
          if (podcast && accentColor) {
            await Core.podcasts.update(podcast?.id, {
              accentColor,
            });
            setPodcast({ ...podcast, accentColor });
          }
        }}
      />
    </View>
  );
}
