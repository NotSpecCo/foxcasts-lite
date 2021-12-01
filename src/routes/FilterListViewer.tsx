import { format } from 'date-fns';
import { EpisodeExtended, FilterList } from 'foxcasts-core/lib/types';
import { formatFileSize, formatTime } from 'foxcasts-core/lib/utils';
import { AppBar } from 'mai-ui/dist/components/appbar';
import { ListItem } from 'mai-ui/dist/components/list';
import { View, ViewContent } from 'mai-ui/dist/components/view';
import { useListNav } from 'mai-ui/dist/hooks';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import Statusbar from '../components/Statusbar';
import { FilterViewOptions, LineOptions } from '../models';
import { Core } from '../services/core';

interface Props {
  listId: string;
  selectedItemId?: string;
}

export default function FilterListViewer({ listId, selectedItemId }: Props): VNode {
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

  function getText(episode: EpisodeExtended, field: LineOptions | null): string | undefined {
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
      <Statusbar text={list?.title || 'Filter'} />
      <ViewContent>
        {list &&
          episodes?.map((episode, i) => (
            <ListItem
              key={episode.id}
              primaryText={getText(episode, list.viewOptions.primaryText)}
              secondaryText={getText(episode, list.viewOptions.secondaryText)}
              accentText={getText(episode, list.viewOptions.accentText)}
              imageUrl={list.viewOptions.showCover ? episode.artwork : undefined}
              selectable={{
                id: episode.id,
                shortcut: i + 1 <= 9 ? i + 1 : undefined,
                selected: episode.id.toString() === selectedItemId,
              }}
            />
          ))}
      </ViewContent>
      <AppBar
        appMenuContent={<FoxcastsAppMenu />}
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
