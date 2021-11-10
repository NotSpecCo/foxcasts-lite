import { Typography } from 'mai-ui/dist/components';
import { AppBar } from 'mai-ui/dist/components/appbar';
import { Grid } from 'mai-ui/dist/components/grid';
import { List, ListItem } from 'mai-ui/dist/components/list';
import { Tile, TileContent } from 'mai-ui/dist/components/tiles';
import { View, ViewContent, ViewHeader } from 'mai-ui/dist/components/view';
import { useToast } from 'mai-ui/dist/contexts';
import { useListNav } from 'mai-ui/dist/hooks';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import { useSettings } from '../contexts/SettingsProvider';
import { SelectablePriority } from '../enums';
import { usePodcasts } from '../hooks/usePodcasts';
import { ListLayout, OpmlFeed } from '../models';
import { subscribe } from '../services/core';
import { KaiOS } from '../services/kaios';
import { OPML } from '../services/opml';

interface Props {
  selectedItemId?: string;
}

export default function Podcasts(props: Props): VNode {
  const { podcasts, loading } = usePodcasts();

  const { settings } = useSettings();
  const { showToast } = useToast();

  const { selectedId } = useListNav({
    initialSelectedId: podcasts.length > 0 ? props.selectedItemId : undefined,
    priority: SelectablePriority.Low,
    onSelect: (id) => route(`/podcast/${id}/episodes`),
  });

  async function seedData(): Promise<void> {
    try {
      // Need to do one at a time so KaiOS can handle it
      await subscribe({ feedUrl: 'https://feed.syntax.fm/rss' });
      await subscribe({ feedUrl: 'https://shoptalkshow.com/feed/podcast' });
      await subscribe({ feedUrl: 'https://feeds.simplecast.com/JoR28o79' }); // React Podcast
      await subscribe({
        feedUrl: 'https://feeds.feedwrench.com/js-jabber.rss',
      });
      await subscribe({ feedUrl: 'https://feeds.megaphone.fm/vergecast' });

      console.log('seed success');
    } catch (err) {
      console.error('Failed to seed data', err);
    }
  }

  async function exportFeeds(): Promise<void> {
    if (!podcasts) return;

    const storageName = KaiOS.storage.getActualStorageName('sdcard');
    const feeds: OpmlFeed[] = podcasts.map((a, i) => ({
      id: i.toString(),
      type: 'rss',
      text: a.title,
      xmlUrl: a.feedUrl,
      description: null,
      htmlUrl: null,
      language: null,
      title: null,
      version: null,
    }));
    OPML.create(`/${storageName}/foxcasts_${new Date().valueOf()}.opml`, feeds)
      .then((res) =>
        showToast(`Successfully exported feeds to ${res.filePath}`)
      )
      .catch(() => showToast(`Failed to export feeds.`));
  }

  return (
    <View>
      <ViewHeader>Podcasts</ViewHeader>
      <ViewContent>
        {loading && <Typography>Loading...</Typography>}
        {settings.podcastsLayout === ListLayout.List ? (
          <List>
            {podcasts?.map((podcast, i) => (
              <ListItem
                key={podcast.id}
                imageUrl={podcast.artwork}
                primaryText={podcast.title}
                selectable={{
                  id: podcast.id,
                  shortcut: i <= 8 ? i + 1 : undefined,
                  selected: podcast.id.toString() === selectedId,
                  ariaLabel: podcast.title,
                }}
              />
            ))}
          </List>
        ) : (
          <Grid>
            {podcasts?.map((podcast, i) => (
              <Tile
                accentColor={podcast.accentColor}
                frontContent={
                  <TileContent
                    backgroundImage={podcast.artwork}
                    scrim={false}
                  />
                }
                backContent={
                  <TileContent contentH="left" contentV="top">
                    <Typography>{podcast.title}</Typography>
                  </TileContent>
                }
                selectable={{
                  id: podcast.id,
                  shortcut: i <= 8 ? i + 1 : undefined,
                  selected: podcast.id.toString() === selectedId,
                  ariaLabel: podcast.title,
                }}
              />
            ))}
          </Grid>
        )}
      </ViewContent>
      <AppBar
        appMenuContent={<FoxcastsAppMenu />}
        centerText="Select"
        actions={[
          {
            id: 'seed',
            label: 'Seed podcasts',
            actionFn: seedData,
          },
          {
            id: 'import',
            label: 'Import OPML',
            keepOpen: true,
            actionFn: (): void => {
              route('/files');
            },
          },
          {
            id: 'export',
            label: 'Export as OPML',
            actionFn: exportFeeds,
          },
        ]}
      />
    </View>
  );
}
