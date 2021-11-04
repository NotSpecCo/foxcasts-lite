import { Playlist } from 'foxcasts-core/lib/types';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState } from 'preact/hooks';
import { useEffect } from 'react';
import { useListNav } from '../hooks/useListNav';
import { Core } from '../services/core';
import { AppBar } from '../ui-components/appbar';
import { ListItem } from '../ui-components/list';
import { View, ViewContent, ViewHeader } from '../ui-components/view';

interface Props {
  selectedItemId?: string;
}

export default function Playlists({ selectedItemId }: Props): VNode {
  const [lists, setLists] = useState<Playlist[]>();

  useEffect(() => {
    Core.getPlaylists().then(setLists);
  }, []);

  useListNav({
    initialSelectedId: lists ? selectedItemId : undefined,
    onSelect: (itemId) => route(`/playlists/${itemId}`, true),
  });

  return (
    <View>
      <ViewHeader>Playlists</ViewHeader>
      <ViewContent>
        {lists?.map((list, i) => (
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
      <AppBar
        actions={[
          {
            id: 'newList',
            label: 'New Playlist',
            keepOpen: true,
            actionFn: () =>
              Core.addPlaylist({
                title: 'My Custom Playlist',
                episodeIds: [1, 2, 3, 4, 5],
                isFavorite: 0,
                removeEpisodeAfterListening: false,
              }).then((id) => route(`/playlists/${id}/edit`)),
          },
          {
            id: 'editList',
            label: 'Edit Playlist',
            disabled: !selectedItemId,
            keepOpen: true,
            actionFn: () => route(`/playlists/${selectedItemId}/edit`),
          },
          {
            id: 'deleteList',
            label: 'Delete Playlist',
            disabled: !selectedItemId,
            actionFn: () =>
              Core.deletePlaylists([Number(selectedItemId)]).then(() => {
                setLists(lists?.filter((a) => a.id !== Number(selectedItemId)));
                route(`/playlists`, true);
              }),
          },
        ]}
      />
    </View>
  );
}
