import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState, useEffect } from 'preact/hooks';
import { Podcast } from '../core/models';
import { View } from '../ui-components';
import { NavItem, setSelected, wrapItems } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';
import { getAllPodcasts, subscribe } from '../core/services/podcasts';
import { GridItem } from '../ui-components/GridItem';
import styles from './Podcasts.module.css';

interface Props {
  selectedItemId?: string;
}

export default function Podcasts({ selectedItemId }: Props): VNode {
  const [items, setItems] = useState<NavItem<Podcast>[]>([]);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    getAllPodcasts().then((result) => {
      setItems(wrapItems(result, 'id', true));
    });
  }, []);

  // Restore scroll position
  useEffect(() => {
    if (!selectedItemId) return;

    const selected = items.find((a) => a.id === selectedItemId);
    if (selected && !selected.isSelected) {
      setItems(setSelected(items, selectedItemId));
    }
  }, [selectedItemId, items]);

  function handlePodcastClick(podcast: Podcast): void {
    route(`/podcast/${podcast.id}`);
  }

  useDpad({
    items,
    onEnter: (item) => handlePodcastClick(item.data),
    onChange: (items) => {
      const selected = items.find((a) => a.isSelected);
      if (selected) {
        route(`/podcasts/?selectedItemId=${selected.id}`, true);
      } else {
        route(`/podcasts/`, true);
      }
      setItems(items);
    },
    options: { stopPropagation: true },
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
      setItems(wrapItems(result, 'id', true));
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
        {items.map((item) => (
          <GridItem
            key={item.data.id}
            ref={item.ref}
            isSelected={item.isSelected}
            dimIfUnselected={items.some((a) => a.isSelected)}
            imageUrl={item.data.artworkUrl100}
            shortcutKey={item.shortcutKey}
            onClick={(): void => handlePodcastClick(item.data)}
          />
        ))}
      </div>
    </View>
  );
}
