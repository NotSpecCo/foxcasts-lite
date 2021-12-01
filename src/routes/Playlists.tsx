import { Playlist } from 'foxcasts-core/lib/types';
import { AppBar } from 'mai-ui/dist/components/appbar';
import { ListItem } from 'mai-ui/dist/components/list';
import { View, ViewContent } from 'mai-ui/dist/components/view';
import { useListNav } from 'mai-ui/dist/hooks';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import Statusbar from '../components/Statusbar';
import { Core } from '../services/core';

interface Props {
  selectedItemId?: string;
  episodeId?: string;
}

export default function Playlists({ selectedItemId, episodeId }: Props): VNode {
  const [lists, setLists] = useState<Playlist[]>();

  useEffect(() => {
    Core.playlists.queryAll().then(setLists);
  }, []);

  useListNav({
    initialSelectedId: lists ? selectedItemId : undefined,
    onSelect: async (itemId) => {
      const list = lists?.find((a) => a.id === Number(itemId));
      if (!list) return;
      if (episodeId && !list.episodeIds.includes(Number(episodeId))) {
        await Core.playlists.update(Number(itemId), {
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
      <Statusbar text={episodeId ? 'Choose a Playlist' : 'Playlists'} />
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
        appMenuContent={<FoxcastsAppMenu />}
        actions={[
          {
            id: 'newList',
            label: 'New Playlist',
            keepOpen: !!episodeId,
            actionFn: async () => {
              await Core.playlists.add({
                title: 'New Playlist',
                episodeIds: episodeId ? [Number(episodeId)] : [],
                isFavorite: 0,
                removeEpisodeAfterListening: false,
              });
              await Core.playlists.queryAll().then(setLists);
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
              Core.playlists.delete([Number(selectedItemId)]).then(() => {
                setLists(lists?.filter((a) => a.id !== Number(selectedItemId)));
                route(`/playlists`, true);
              }),
          },
        ]}
      />
    </View>
  );
}
