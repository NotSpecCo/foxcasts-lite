import { format, startOfDay } from 'date-fns';
import { EpisodeExtended, Podcast } from 'foxcasts-core/lib/types';
import { AppBar } from 'mai-ui/dist/components/appbar';
import { List, ListItem, ListSection } from 'mai-ui/dist/components/list';
import { Typography } from 'mai-ui/dist/components/Typography';
import { View, ViewContent, ViewHeader } from 'mai-ui/dist/components/view';
import { useListNav } from 'mai-ui/dist/hooks';
import { h } from 'preact';
import { route } from 'preact-router';
import { useEffect } from 'react';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import { useFetchedState } from '../hooks/useFetchedState';
import { Core } from '../services/core';

interface Props {
  selectedItemId?: string;
}

type PodcastWithEpisodes = Podcast & {
  episodes: EpisodeExtended[];
};

export default function Home({ selectedItemId }: Props): h.JSX.Element {
  const newEpisodes = useFetchedState<EpisodeExtended[]>();
  const favEpisodes = useFetchedState<EpisodeExtended[]>();
  const favPodcasts = useFetchedState<PodcastWithEpisodes[]>();

  useEffect(() => {
    favEpisodes.getData(() =>
      Core.episodes.queryAll({ isFavorite: 1, limit: 5 })
    );
    favPodcasts.getData(async () => {
      const result: PodcastWithEpisodes[] = [];
      const podcasts = await Core.podcasts.queryAll({ isFavorite: 1 });
      for (const podcast of podcasts) {
        const episodes = await Core.episodes.queryAll({
          podcastIds: [podcast.id],
          limit: 1,
        });
        result.push({
          ...podcast,
          episodes,
        });
      }
      return result;
    });
    newEpisodes.getData(async () => {
      await Core.podcasts.checkForUpdates();
      return Core.episodes.queryAll({
        afterDate: startOfDay(new Date()).toISOString(),
      });
    });
  }, []);

  useListNav({
    initialSelectedId:
      newEpisodes.data && favEpisodes.data && favPodcasts.data
        ? selectedItemId
        : undefined,
    updateRouteOnChange: true,
    onSelect: (id) => route(`/episode/${id.split('_')[1]}/info`),
  });

  return (
    <View>
      <ViewContent>
        <ViewHeader>Home</ViewHeader>
        <Typography type="subtitle">Just Added</Typography>
        {newEpisodes.loading && (
          <Typography>Checking for new episodes...</Typography>
        )}
        {!newEpisodes.loading && newEpisodes.data?.length === 0 && (
          <Typography>Nothing new</Typography>
        )}
        <List>
          {newEpisodes.data?.map((episode) => (
            <ListItem
              imageUrl={episode.artwork}
              primaryText={episode.title}
              secondaryText={episode.podcastTitle}
              selectable={{
                id: `new_${episode.id}`,
                selected: `new_${episode.id}` === selectedItemId,
              }}
            />
          ))}
          <Typography type="subtitle">Favorites</Typography>
          <Typography padding="both">
            The latest episodes from your favorite podcasts.
          </Typography>
          {favPodcasts.data?.map((podcast) => (
            <ListSection>
              <Typography
                type="caption"
                padding="horizontal"
                style={{ color: podcast.accentColor, fontWeight: 600 }}
              >
                {podcast.title}
              </Typography>
              {podcast.episodes.map((episode) => (
                <ListItem
                  imageUrl={episode.artwork}
                  primaryText={episode.title}
                  secondaryText={format(
                    new Date(episode.date),
                    'cccc, MMMM do'
                  )}
                  selectable={{
                    id: `recent_${episode.id}`,
                    selected: `recent_${episode.id}` === selectedItemId,
                  }}
                />
              ))}
            </ListSection>
          ))}
        </List>
      </ViewContent>
      <AppBar
        appMenuContent={<FoxcastsAppMenu />}
        actions={[
          {
            id: 'refresh',
            label: 'Check for new episodes',
            actionFn: () => console.log('refresh'),
          },
        ]}
      />
    </View>
  );
}
