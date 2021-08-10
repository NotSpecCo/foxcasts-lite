import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState, useEffect } from 'preact/hooks';
import { Podcast } from '../core/models';
import { View } from '../ui-components';
import { setSelected } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';
import { getAllPodcasts, subscribe } from '../core/services/podcasts';
import { GridItem } from '../ui-components/GridItem';
import styles from './Podcasts.module.css';

interface Props {
  selectedItemId?: string;
}

export default function Podcasts({ selectedItemId }: Props): VNode {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [seeding, setSeeding] = useState(false);

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
      console.log(itemId);

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
      await Promise.all([
        subscribe(1237401284), // JavaScript Jabber
        subscribe(493890455), // Shop Talk
        subscribe(1253186678), // Syntax
        subscribe(1341969432), // React Podcast
        subscribe(430333725), // Vergecast
      ]);
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
    if (action === 'seed') {
      await seedData();
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
      ]}
      onAction={handleAction}
    >
      <div className={styles.grid}>
        {podcasts.map((podcast, i) => (
          <GridItem
            key={podcast.id}
            itemId={podcast.id}
            dimIfUnselected={!!selectedItemId}
            imageUrl={podcast.artworkUrl100}
            shortcutKey={i + 1}
            onClick={(): void => viewPodcast(podcast.id)}
          />
        ))}
      </div>
    </View>
  );
}
