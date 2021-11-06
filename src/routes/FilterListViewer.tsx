import { format } from 'date-fns';
import { EpisodeExtended, FilterList } from 'foxcasts-core/lib/types';
import { formatFileSize, formatTime } from 'foxcasts-core/lib/utils';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState } from 'preact/hooks';
import { useEffect } from 'react';
import { useListNav } from '../hooks/useListNav';
import { FilterViewOptions, LineOptions } from '../models';
import { Core } from '../services/core';
import { AppBar } from '../ui-components/appbar';
import { ListItem } from '../ui-components/list';
import { View, ViewContent, ViewHeader } from '../ui-components/view';

interface Props {
  listId: string;
  selectedItemId?: string;
}

export default function FilterListViewer({
  listId,
  selectedItemId,
}: Props): VNode {
  const [list, setList] = useState<FilterList<FilterViewOptions>>();
  const [episodes, setEpisodes] = useState<EpisodeExtended[]>();

  useEffect(() => {
    Core.filters
      .query<FilterViewOptions>({ id: Number(listId) })
      .then((res) => {
        if (!res) return;

        setList(res);
        return Core.episodes.queryAll(res.query);
      })
      .then(setEpisodes);
  }, []);

  useListNav({
    initialSelectedId: list ? selectedItemId : undefined,
    onSelect: (itemId) => itemId && route(`/episode/${itemId}/info`),
  });

  function getText(
    episode: EpisodeExtended,
    field: LineOptions | null
  ): string | undefined {
    if (field === 'date') {
      return format(new Date(episode.date), 'cccc, MMM do');
    } else if (field === 'description') {
      return episode.description;
    } else if (field === 'duration') {
      return formatTime(episode.duration);
    } else if (field === 'fileSize') {
      return formatFileSize(episode.fileSize);
    } else if (field === 'podcastTitle') {
      return episode.podcastTitle;
    } else if (field === 'title') {
      return episode.title;
    } else {
      return undefined;
    }
  }

  return (
    <View>
      <ViewHeader>{list?.title || 'Filter'}</ViewHeader>
      <ViewContent>
        {list &&
          episodes?.map((episode, i) => (
            <ListItem
              key={episode.id}
              primaryText={getText(episode, list.viewOptions.primaryText)}
              secondaryText={getText(episode, list.viewOptions.secondaryText)}
              accentText={getText(episode, list.viewOptions.accentText)}
              imageUrl={
                list.viewOptions.showCover ? episode.artwork : undefined
              }
              selectable={{
                id: episode.id,
                shortcut: i + 1 <= 9 ? i + 1 : undefined,
                selected: episode.id.toString() === selectedItemId,
              }}
            />
          ))}
      </ViewContent>
      <AppBar
        centerText={selectedItemId ? 'Select' : ''}
        actions={[
          {
            id: 'edit',
            label: 'Edit List',
            keepOpen: true,
            actionFn: () => route(`/filters/${listId}/edit`),
          },
        ]}
      />
    </View>
  );
}
