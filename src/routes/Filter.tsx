import { h, createRef } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { EpisodeExtended, EpisodeFilterId } from '../core/models';
import { EpisodeService } from '../core/services';
import styles from './Filter.module.css';
import { ListItem, View } from '../ui-components';
import { NavItem } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';

const episodeService = new EpisodeService();

interface FilterProps {
  filterId: EpisodeFilterId;
}

export default function Filter({ filterId }: FilterProps): any {
  const [items, setItems] = useState<NavItem<EpisodeExtended>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const filterName: any = {
    recent: 'Most Recent',
    inProgress: 'In Progress',
  };

  useEffect(() => {
    episodeService.getByFilter(filterId).then((episodes) => {
      setItems(
        episodes.map((episode) => ({
          shortcutKey: '',
          isSelected: false,
          ref: createRef(),
          data: episode,
        }))
      );
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
          onClick={(): void => viewEpisode(item.data)}
        />
      ))}
    </View>
  );
}
