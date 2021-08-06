import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { EpisodeExtended, EpisodeFilterId } from '../core/models';
import styles from './Filter.module.css';
import { ListItem, View } from '../ui-components';
import { NavItem, setSelected, wrapItems } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';
import { getEpisodesByFilter } from '../core/services/podcasts';

interface FilterProps {
  filterId: EpisodeFilterId;
  selectedItemId?: string;
}

export default function Filter({
  filterId,
  selectedItemId,
}: FilterProps): VNode {
  const [items, setItems] = useState<NavItem<EpisodeExtended>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getEpisodesByFilter(filterId).then((episodes) => {
      setItems(wrapItems(episodes, 'id', true));
      setLoading(false);
    });
  }, [filterId]);

  // Restore scroll position
  useEffect(() => {
    if (!selectedItemId) return;

    const selected = items.find((a) => a.id === selectedItemId);
    if (selected && !selected.isSelected) {
      setItems(setSelected(items, selectedItemId));
    }
  }, [selectedItemId, items]);

  function viewEpisode(episode: EpisodeExtended): void {
    route(`/episode/${episode.id}`);
  }

  useDpad({
    items,
    onEnter: (item) => viewEpisode(item.data),
    onChange: (items) => {
      const selected = items.find((a) => a.isSelected);
      if (selected) {
        route(`/filter/${filterId}?selectedItemId=${selected.id}`, true);
      } else {
        route(`/filter/${filterId}`, true);
      }
      setItems(items);
    },
    options: { stopPropagation: true },
  });

  const filterName: { [key: string]: string } = {
    recent: 'Most Recent',
    inProgress: 'In Progress',
  };

  return (
    <View headerText={filterName[filterId]}>
      {loading && <div className={`kui-sec ${styles.message}`}>Loading...</div>}
      {!loading && items.length === 0 && (
        <div className={`kui-sec ${styles.message}`}>No episodes.</div>
      )}
      {items.map((item) => (
        <ListItem
          key={item.data.id}
          ref={item.ref}
          isSelected={item.isSelected}
          imageUrl={item.data.artworkUrl60}
          primaryText={item.data.title}
          secondaryText={new Date(item.data.date).toLocaleDateString()}
          shortcutKey={item.shortcutKey}
          onClick={(): void => viewEpisode(item.data)}
        />
      ))}
    </View>
  );
}
