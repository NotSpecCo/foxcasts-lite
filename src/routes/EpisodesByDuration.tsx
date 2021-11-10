import { EpisodeExtended } from 'foxcasts-core/lib/types';
import { formatTime } from 'foxcasts-core/lib/utils';
import { AppBar } from 'mai-ui/dist/components/appbar';
import { ListItem } from 'mai-ui/dist/components/list';
import { Typography } from 'mai-ui/dist/components/Typography';
import {
  View,
  ViewContent,
  ViewHeader,
  ViewTabBar,
} from 'mai-ui/dist/components/view';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import { useListNav } from '../hooks/useListNav';
import { Core } from '../services/core';

interface Props {
  tabId: 'short' | 'medium' | 'long' | 'longest';
  selectedItemId?: string;
}

const durations = {
  short: {
    longerThan: 5,
    shorterThan: 900,
  },
  medium: {
    longerThan: 900,
    shorterThan: 1800,
  },
  long: {
    longerThan: 1800,
    shorterThan: 2700,
  },
  longer: {
    longerThan: 2700,
    shorterThan: 3600,
  },
  longest: {
    longerThan: 3600,
    shorterThan: Infinity,
  },
};

export default function EpisodesByDuration({
  tabId,
  selectedItemId,
}: Props): VNode {
  const [episodes, setEpisodes] = useState<EpisodeExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setEpisodes([]);
    setLoading(true);

    Core.episodes
      .queryAll({
        longerThan: durations[tabId].longerThan,
        shorterThan: durations[tabId].shorterThan,
        limit: 30,
      })
      .then((res) => {
        setEpisodes(res);
        setLoading(false);
      });
  }, [tabId]);

  useListNav({
    initialSelectedId: episodes.length > 0 ? selectedItemId : undefined,
    onSelect: (itemId) => itemId && route(`/episode/${itemId}/info`),
  });

  return (
    <View>
      <ViewHeader>Duration</ViewHeader>
      <ViewTabBar
        tabs={[
          { id: 'short', label: '1-15 mins' },
          { id: 'medium', label: '15-30 mins' },
          { id: 'long', label: '30-45 mins' },
          { id: 'longer', label: '45-60 mins' },
          { id: 'longest', label: '60+ mins' },
        ]}
        selectedId={tabId}
        onChange={(tabId): boolean => route(`/filters/duration/${tabId}`, true)}
      />
      <ViewContent>
        {loading && <Typography>Loading...</Typography>}
        {!loading && episodes.length === 0 && (
          <Typography>No episodes.</Typography>
        )}
        {episodes.map((episode, i) => (
          <ListItem
            key={episode.id}
            imageUrl={episode.artwork}
            primaryText={episode.title}
            secondaryText={formatTime(episode.duration)}
            selectable={{
              id: episode.id,
              shortcut: i + 1 <= 9 ? i + 1 : undefined,
              selected: episode.id.toString() === selectedItemId,
            }}
          />
        ))}
      </ViewContent>
      <AppBar appMenuContent={<FoxcastsAppMenu />} />
    </View>
  );
}
