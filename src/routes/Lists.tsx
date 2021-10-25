import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import styles from './Lists.module.css';
import { EpisodeExtended, EpisodeFilterId } from 'foxcasts-core/lib/types';
import { Core } from '../services/core';
import { useListNav } from '../hooks/useListNav';
import { View, ViewContent, ViewTabs } from '../ui-components2/view';
import { AppBar } from '../ui-components2/appbar';
import { ListItem } from '../ui-components2/list';
import { format } from 'date-fns';

interface Props {
  listId: EpisodeFilterId;
  selectedItemId?: string;
}

export default function Lists({ listId, selectedItemId }: Props): VNode {
  const [episodes, setEpisodes] = useState<EpisodeExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Core.getEpisodesByFilter(listId, { page: 0, numItems: 30 }).then((eps) => {
      setEpisodes(eps);
      setLoading(false);
    });
  }, [listId]);

  useListNav({
    initialSelectedId: episodes.length > 0 ? selectedItemId : undefined,
    onSelect: (itemId) => itemId && route(`/episode/${itemId}`),
  });

  return (
    <View>
      <ViewTabs
        tabs={[
          { id: 'recent', label: 'most recent ' },
          { id: 'inProgress', label: 'in progress' },
        ]}
        selectedId={listId}
        onChange={(tabId): boolean => route(`/lists/${tabId}`, true)}
      />
      <ViewContent>
        {loading && (
          <div className={`kui-sec ${styles.message}`}>Loading...</div>
        )}
        {!loading && episodes.length === 0 && (
          <div className={`kui-sec ${styles.message}`}>No episodes.</div>
        )}
        {episodes.map((episode, i) => (
          <ListItem
            key={episode.id}
            imageUrl={episode.artwork}
            primaryText={episode.title}
            secondaryText={format(new Date(episode.date), 'ccc, MMMM do')}
            selectable={{
              id: episode.id,
              shortcut: i + 1 <= 9 ? i + 1 : undefined,
              selected: episode.id.toString() === selectedItemId,
            }}
          />
        ))}
      </ViewContent>
      <AppBar />
    </View>
  );
}