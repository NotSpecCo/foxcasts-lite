import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { EpisodeExtended, EpisodeFilterId } from '../core/models';
import styles from './Filter.module.css';
import { ListItem, View } from '../ui-components';
import { setSelected } from '../utils/navigation';
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
  const [episodes, setEpisodes] = useState<EpisodeExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getEpisodesByFilter(filterId).then((eps) => {
      setEpisodes(eps);
      setLoading(false);
    });
  }, [filterId]);

  // Restore scroll position
  useEffect(() => {
    if (!selectedItemId) return;
    setSelected(selectedItemId, true);
  }, [selectedItemId, episodes]);

  function viewEpisode(episodeId: string | number): void {
    route(`/episode/${episodeId}`);
  }

  useDpad({
    onEnter: (itemId) => viewEpisode(itemId),
    onChange: (itemId) => {
      if (itemId) {
        route(`/filter/${filterId}?selectedItemId=${itemId}`, true);
      } else {
        route(`/filter/${filterId}`, true);
      }
    },
  });

  const filterName: { [key: string]: string } = {
    recent: 'Most Recent',
    inProgress: 'In Progress',
  };

  return (
    <View headerText={filterName[filterId]}>
      {loading && <div className={`kui-sec ${styles.message}`}>Loading...</div>}
      {!loading && episodes.length === 0 && (
        <div className={`kui-sec ${styles.message}`}>No episodes.</div>
      )}
      {episodes.map((episode, i) => (
        <ListItem
          key={episode.id}
          itemId={episode.id}
          imageUrl={episode.cover}
          primaryText={episode.title}
          secondaryText={new Date(episode.date).toLocaleDateString()}
          shortcutKey={i + 1}
          onClick={(): void => viewEpisode(episode.id)}
        />
      ))}
    </View>
  );
}
