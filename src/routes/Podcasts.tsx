import { Fragment, h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState, useEffect } from 'preact/hooks';
import { Podcast } from '../core/models';
import { ListItem, View } from '../ui-components';
import { setSelected } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';
import { getAllPodcasts, subscribeByFeed } from '../core/services/podcasts';
import { GridItem } from '../ui-components/GridItem';
import styles from './Podcasts.module.css';
import { useSettings } from '../contexts/SettingsProvider';
import { PodcastsLayout } from '../models';

interface Props {
  selectedItemId?: string;
}

export default function Podcasts({ selectedItemId }: Props): VNode {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [seeding, setSeeding] = useState(false);

  const { settings } = useSettings();

  useEffect(() => {
    getAllPodcasts().then((result) => {
      setPodcasts(result);
    });
  }, []);

  /// Restore scroll position
  useEffect(() => {
    if (!selectedItemId) return;
    setSelected(selectedItemId, true);
  }, [selectedItemId, podcasts]);

  function viewPodcast(podcastId: string | number): void {
    route(`/podcast/${podcastId}`);
  }

  useDpad({
    onEnter: (itemId) => viewPodcast(itemId),
    onChange: (itemId) => {
      if (itemId) {
        route(`/podcasts/?selectedItemId=${itemId}`, true);
      } else {
        route(`/podcasts/`, true);
      }
    },
  });

  async function seedData(): Promise<void> {
    setSeeding(true);
    try {
      // Need to do one at a time so KaiOS can handle it
      await subscribeByFeed('https://feed.syntax.fm/rss');
      await subscribeByFeed('https://shoptalkshow.com/feed/podcast');
      await subscribeByFeed('https://feeds.simplecast.com/JoR28o79'); // React Podcast
      await subscribeByFeed('https://feeds.feedwrench.com/js-jabber.rss');
      await subscribeByFeed('https://feeds.megaphone.fm/vergecast');

      console.log('seed success');
    } catch (err) {
      console.error('Failed to seed data', err);
    }

    getAllPodcasts().then((result) => {
      setPodcasts(result);
    });

    setSeeding(false);
  }

  async function handleAction(action: string): Promise<void> {
    switch (action) {
      case 'seed':
        await seedData();
        break;
      case 'import':
        route('/import');
        break;
    }
  }

  return (
    <View
      headerText="Podcasts"
      actions={[
        {
          id: 'seed',
          label: seeding ? 'Seeding...' : 'Seed podcasts',
          disabled: seeding,
        },
        {
          id: 'import',
          label: 'Import OPML',
        },
      ]}
      onAction={handleAction}
    >
      {settings.podcastsLayout === PodcastsLayout.List ? (
        <Fragment>
          {podcasts.map((podcast, i) => (
            <ListItem
              key={podcast.id}
              itemId={podcast.id}
              imageUrl={podcast.artwork}
              primaryText={podcast.title}
              shortcutKey={i <= 8 ? i + 1 : undefined}
              onClick={(): void => viewPodcast(podcast.id)}
            />
          ))}
        </Fragment>
      ) : (
        <div className={styles.grid}>
          {podcasts.map((podcast, i) => (
            <GridItem
              key={podcast.id}
              itemId={podcast.id}
              dimIfUnselected={!!selectedItemId}
              imageUrl={podcast.artwork}
              shortcutKey={i + 1}
              onClick={(): void => viewPodcast(podcast.id)}
            />
          ))}
        </div>
      )}
    </View>
  );
}
