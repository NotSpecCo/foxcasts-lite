import { Playlist } from 'foxcasts-core/lib/types';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState } from 'preact/hooks';
import { useEffect } from 'react';
import { useListNav } from '../hooks/useListNav';
import { Core } from '../services/core';
import { AppBar } from '../ui-components/appbar';
import { Input, ToggleRow } from '../ui-components/form';
import { List, ListSection } from '../ui-components/list';
import { View, ViewContent, ViewHeader } from '../ui-components/view';

interface Props {
  listId: string;
  selectedItemId?: string;
}

export default function PlaylistEditor({
  listId,
  selectedItemId,
}: Props): VNode {
  const [list, setList] = useState<Playlist>();

  useEffect(() => {
    Core.playlists.query({ id: Number(listId) }).then(setList);
  }, []);

  function updateList(key: keyof Playlist, value: any) {
    return Core.playlists
      .update(Number(listId), {
        [key]: value,
      })
      .then(() => Core.playlists.query({ id: Number(listId) }))
      .then(setList);
  }

  const { selectedId } = useListNav({
    initialSelectedId: list ? selectedItemId : undefined,
  });

  return (
    <View>
      <ViewHeader>Edit Playlist</ViewHeader>
      <ViewContent>
        <List>
          <ListSection>
            <Input
              value={list?.title}
              selectable={{
                id: 'listTitle',
                selected: selectedId === 'listTitle',
              }}
              onChange={(value) => updateList('title', value)}
            />
            <ToggleRow
              label="Remove After Listening"
              value={list?.removeEpisodeAfterListening || false}
              selectable={{
                id: 'removeAfterListening',
                selected: selectedId === 'removeAfterListening',
              }}
              onChange={(value) =>
                updateList('removeEpisodeAfterListening', value)
              }
            />
          </ListSection>
        </List>
      </ViewContent>
      <AppBar
        centerText={selectedId ? 'Select' : ''}
        actions={[
          {
            id: 'delete',
            label: 'Delete List',
            keepOpen: true,
            actionFn: () =>
              Core.playlists.delete([Number(listId)]).then(() => {
                route(`/playlists`, true);
              }),
          },
        ]}
      />
    </View>
  );
}
