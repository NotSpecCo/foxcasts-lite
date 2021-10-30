import { EpisodeFilterOptions } from 'foxcasts-core/lib/types';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState } from 'preact/hooks';
import { useListNav } from '../hooks/useListNav';
import { AppBar } from '../ui-components/appbar';
import { ListItem } from '../ui-components/list';
import { View, ViewContent, ViewHeader } from '../ui-components/view';

interface Props {
  selectedItemId?: string;
}

type List = {
  id: string;
  title: string;
  editable: boolean;
  filter?: Partial<EpisodeFilterOptions>;
};

export default function Lists({ selectedItemId }: Props): VNode {
  const [lists, setLists] = useState<List[]>([
    { id: 'recent', title: 'Recent Episodes', editable: false },
    { id: 'duration', title: 'Episodes by Duration', editable: false },
    // {
    //   id: 'downloaded',
    //   title: 'Downloaded',
    //   editable: true,
    //   filter: { isDownloaded: true, limit: 30 },
    // },
  ]);

  useListNav({
    initialSelectedId: lists.length > 0 ? selectedItemId : undefined,
    onSelect: (itemId) => {
      switch (itemId) {
        case 'recent':
          route('/lists/recent/week0');
          break;
        case 'duration':
          route('/lists/duration/short');
          break;
        default:
          route(`/lists/${itemId}`);
          break;
      }
    },
  });

  return (
    <View>
      <ViewHeader>Lists</ViewHeader>
      <ViewContent>
        {lists.map((list, i) => (
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
      </ViewContent>
      <AppBar />
    </View>
  );
}
