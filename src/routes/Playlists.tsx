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
  episodeId?: string;
}

export default function Playlists({ selectedItemId, episodeId }: Props): VNode {
  const [lists, setLists] = useState<Playlist[]>();

  useEffect(() => {
    Core.getPlaylists().then(setLists);
  }, []);

  useListNav({
    initialSelectedId: lists ? selectedItemId : undefined,
    onSelect: async (itemId) => {
      const list = lists?.find((a) => a.id === Number(itemId));
      if (!list) return;
      if (episodeId && !list.episodeIds.includes(Number(episodeId))) {
        await Core.updatePlaylist(Number(itemId), {
          episodeIds: [...list.episodeIds, Number(episodeId)],
        });
        history.back();
      } else if (episodeId) {
        history.back();
      } else {
        route(`/playlists/${itemId}`);
      }
    },
  });

  return (
    <View>
      <ViewHeader>{episodeId ? 'Choose a Playlist' : 'Playlists'}</ViewHeader>
      <ViewContent>
        {lists?.map((list, i) => (
          <ListItem
            key={list.id}
            primaryText={list.title}
            secondaryText={`${list.episodeIds.length} episodes`}
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
            keepOpen: !!episodeId,
            actionFn: async () => {
              await Core.addPlaylist({
                title: 'New Playlist',
                episodeIds: episodeId ? [Number(episodeId)] : [],
                isFavorite: 0,
                removeEpisodeAfterListening: false,
              });
              await Core.getPlaylists().then(setLists);
              if (episodeId) history.back();
            },
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