import { h, createRef, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { EpisodeExtended, EpisodeFilterId } from '../core/models';
import { EpisodeService } from '../core/services';
import styles from './Filter.module.css';
import { ListItem, View } from '../ui-components';
import { NavItem, wrapItems } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';

const episodeService = new EpisodeService();

interface FilterProps {
  filterId: EpisodeFilterId;
}

export default function Filter({ filterId }: FilterProps): VNode {
  const [items, setItems] = useState<NavItem<EpisodeExtended>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    episodeService.getByFilter(filterId).then((episodes) => {
      setItems(wrapItems(episodes, true));
      setLoading(false);
    });
  }, [filterId]);

  function viewEpisode(episode: EpisodeExtended): void {
    route(`/episode/${episode.id}`);
  }

  useDpad({
    items,
    onEnter: (item) => viewEpisode(item.data),
    onChange: (items) => setItems(items),
    options: { stopPropagation: true },
  });

  const filterName: { [key: string]: string } = {
    recent: 'Most Recent',
    inProgress: 'In Progress',
  };

  return (
    <View showHeader={false} headerText={filterName[filterId]}>
      {loading && <div className={`kui-sec ${styles.message}`}>Loading...</div>}
      {!loading && items.length === 0 && (
        <div className={`kui-sec ${styles.message}`}>No episodes.</div>
      )}
      {items.map((item) => (
        <ListItem
          key={item.data.id}
          ref={item.ref}
          isSelected={item.isSelected}
          imageUrl={item.data.cover[60]}
          primaryText={item.data.title}
          secondaryText={item.data.date.toLocaleDateString()}
          shortcutKey={item.shortcutKey}
          onClick={(): void => viewEpisode(item.data)}
        />
      ))}
    </View>
  );
}
