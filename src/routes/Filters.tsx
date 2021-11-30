import { FilterList } from 'foxcasts-core/lib/types';
import { AppBar } from 'mai-ui/dist/components/appbar';
import { ListItem } from 'mai-ui/dist/components/list';
import { View, ViewContent, ViewHeader } from 'mai-ui/dist/components/view';
import { useListNav } from 'mai-ui/dist/hooks';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import { FilterViewOptions } from '../models';
import { Core } from '../services/core';

interface Props {
  selectedItemId?: string;
}

type List = {
  id: string;
  title: string;
};

export default function Filters({ selectedItemId }: Props): VNode {
  const [defaultLists] = useState<List[]>([
    { id: 'recent', title: 'Recent Episodes' },
    { id: 'duration', title: 'Episodes by Duration' },
  ]);
  const [lists, setLists] = useState<FilterList<FilterViewOptions>[]>();

  useEffect(() => {
    Core.filters.queryAll<FilterViewOptions>().then(setLists);
  }, []);

  useListNav({
    initialSelectedId: lists ? selectedItemId : undefined,
    onSelect: (itemId) => {
      switch (itemId) {
        case 'recent':
          route('/filters/recent/week0');
          break;
        case 'duration':
          route('/filters/duration/short');
          break;
        default:
          route(`/filters/${itemId}`);
          break;
      }
    },
  });

  return (
    <View>
      <ViewHeader>Filters</ViewHeader>
      <ViewContent>
        {defaultLists.map((list, i) => (
          <ListItem
            key={list.id}
            primaryText={list.title}
            selectable={{
              id: list.id,
              shortcut: i + 1 <= 9 ? i + 1 : undefined,
              selected: list.id.toString() === selectedItemId,
            }}
          />
        ))}
        {lists?.map((list, i) => (
          <ListItem
            key={list.id}
            primaryText={list.title}
            selectable={{
              id: list.id,
              shortcut: i + 1 + defaultLists.length <= 9 ? i + 1 + defaultLists.length : undefined,
              selected: list.id.toString() === selectedItemId,
            }}
          />
        ))}
      </ViewContent>
      <AppBar
        appMenuContent={<FoxcastsAppMenu />}
        actions={[
          {
            id: 'newList',
            label: 'New List',
            keepOpen: true,
            actionFn: () =>
              Core.filters
                .add<FilterViewOptions>({
                  title: 'My Custom Filter',
                  query: {},
                  isFavorite: 0,
                  viewOptions: {
                    primaryText: 'title',
                    secondaryText: 'podcastTitle',
                    accentText: null,
                    showCover: true,
                  },
                })
                .then((id) => route(`/filters/${id}/edit`)),
          },
          {
            id: 'editList',
            label: 'Edit List',
            disabled:
              !selectedItemId || selectedItemId === 'recent' || selectedItemId === 'duration',
            keepOpen: true,
            actionFn: () => route(`/filters/${selectedItemId}/edit`),
          },
          {
            id: 'deleteList',
            label: 'Delete List',
            disabled:
              !selectedItemId || selectedItemId === 'recent' || selectedItemId === 'duration',
            actionFn: () =>
              Core.filters.delete([Number(selectedItemId)]).then(() => {
                setLists(lists?.filter((a) => a.id !== Number(selectedItemId)));
                route(`/filters`, true);
              }),
          },
        ]}
      />
    </View>
  );
}
