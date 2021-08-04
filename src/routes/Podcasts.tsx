import { h } from 'preact';
import { route } from 'preact-router';
import { useState, useEffect } from 'preact/hooks';
import { Podcast } from '../core/models';
import { PodcastService } from '../core/services';
import { ListItem, View } from '../ui-components';
import { NavItem, wrapItems } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';

const podcastService = new PodcastService();

export default function Podcasts(): any {
  const [items, setItems] = useState<NavItem<Podcast>[]>([]);

  useEffect(() => {
    podcastService.getAll().then((result) => {
      setItems(wrapItems(result, true));
    });
  }, []);

  function handlePodcastClick(podcast: Podcast): void {
    route(`/podcast/${podcast.id}`);
  }

  useDpad({
    items,
    onEnter: (item) => handlePodcastClick(item.data),
    onChange: (items) => setItems(items),
    options: { stopPropagation: true },
  });

  // useShortcutKeys(podcasts, {}, (podcast) => handlePodcastClick(podcast)());

  async function seedData() {
    try {
      await Promise.all([
        podcastService.subscribe(1237401284), // JavaScript Jabber
        podcastService.subscribe(493890455), // Shop Talk
        podcastService.subscribe(1253186678), // Syntax
        podcastService.subscribe(1341969432), // React Podcast
        podcastService.subscribe(430333725), // Vergecast
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
          imageUrl={item.data.cover[60]}
          primaryText={item.data.title}
          shortcutKey={item.shortcutKey}
          onClick={(): void => handlePodcastClick(item.data)}
        />
      ))}
    </View>
  );
}
