import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState, useEffect } from 'preact/hooks';
import { Podcast } from '../core/models';
import { ListItem, View } from '../ui-components';
import { NavItem, setSelected, wrapItems } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';
import { getAllPodcasts, subscribe } from '../core/services/podcasts';

interface Props {
  selectedItemId?: string;
}

export default function Podcasts({ selectedItemId }: Props): VNode {
  const [items, setItems] = useState<NavItem<Podcast>[]>([]);

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

  async function seedData() {
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
  }

  async function handleAction(action: string): Promise<void> {
    if (action === 'seed') {
      await seedData();
    }
  }

  return (
    <View
      headerText="Podcasts"
      actions={[{ id: 'seed', label: 'Seed podcasts' }]}
      onAction={handleAction}
    >
      {items.map((item) => (
        <ListItem
          key={item.data.id}
          ref={item.ref}
          isSelected={item.isSelected}
          imageUrl={item.data.artworkUrl60}
          primaryText={item.data.title}
          shortcutKey={item.shortcutKey}
          onClick={(): void => handlePodcastClick(item.data)}
        />
      ))}
    </View>
  );
}
