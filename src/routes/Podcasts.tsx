import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useSettings } from '../contexts/SettingsProvider';
import { useToast } from '../contexts/ToastProvider';
import { SelectablePriority } from '../hooks/useDpad';
import { useListNav } from '../hooks/useListNav';
import { usePodcasts } from '../hooks/usePodcasts';
import { ListLayout, OpmlFeed } from '../models';
import { subscribe } from '../services/core';
import { KaiOS } from '../services/kaios';
import { OPML } from '../services/opml';
import { AppBar } from '../ui-components/appbar';
import { GridItem } from '../ui-components/GridItem';
import { List, ListItem } from '../ui-components/list';
import { Typography } from '../ui-components/Typography';
import { View, ViewContent, ViewHeader } from '../ui-components/view';
import styles from './Podcasts.module.css';

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
                }}
              />
            ))}
          </List>
        ) : (
          <div className={styles.grid}>
            {podcasts?.map((podcast, i) => (
              <GridItem
                key={podcast.id}
                dimIfUnselected={!!selectedId}
                imageUrl={podcast.artwork || podcast.artworkUrl}
                selectable={{
                  id: podcast.id,
                  shortcut: i <= 8 ? i + 1 : undefined,
                  selected: podcast.id.toString() === selectedId,
                }}
              />
            ))}
          </div>
        )}
      </ViewContent>
      <AppBar
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
