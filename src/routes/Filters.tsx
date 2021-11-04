import { FilterList } from 'foxcasts-core/lib/types';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState } from 'preact/hooks';
import { useEffect } from 'react';
import { useListNav } from '../hooks/useListNav';
import { FilterViewOptions } from '../models';
import { Core } from '../services/core';
import { AppBar } from '../ui-components/appbar';
import { ListItem } from '../ui-components/list';
import { View, ViewContent, ViewHeader } from '../ui-components/view';

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
    Core.getFilterLists<FilterViewOptions>().then(setLists);
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
          route(`/filters/${itemId}`, true);
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
              shortcut:
                i + 1 + defaultLists.length <= 9
                  ? i + 1 + defaultLists.length
                  : undefined,
              selected: list.id.toString() === selectedItemId,
            }}
          />
        ))}
      </ViewContent>
      <AppBar
        actions={[
          {
            id: 'newList',
            label: 'New List',
            keepOpen: true,
            actionFn: () =>
              Core.addFilterList<FilterViewOptions>({
                title: 'My Custom Filter',
                query: {},
                isFavorite: 0,
                viewOptions: {
                  primaryText: 'title',
                  secondaryText: 'podcastTitle',
                  accentText: null,
                  showCover: true,
                },
              }).then((id) => route(`/filters/${id}/edit`)),
          },
          {
            id: 'editList',
            label: 'Edit List',
            disabled:
              !selectedItemId ||
              selectedItemId === 'recent' ||
              selectedItemId === 'duration',
            keepOpen: true,
            actionFn: () => route(`/filters/${selectedItemId}/edit`),
          },
          {
            id: 'deleteList',
            label: 'Delete List',
            disabled:
              !selectedItemId ||
              selectedItemId === 'recent' ||
              selectedItemId === 'duration',
            actionFn: () =>
              Core.deleteFilterLists([Number(selectedItemId)]).then(() => {
                setLists(lists?.filter((a) => a.id !== Number(selectedItemId)));
                route(`/filters`, true);
              }),
          },
        ]}
      />
    </View>
  );
}
