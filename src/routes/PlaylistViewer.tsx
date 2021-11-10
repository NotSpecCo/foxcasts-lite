import { PlaylistExtended } from 'foxcasts-core/lib/types';
import { AppBar } from 'mai-ui/dist/components/appbar';
import { ListItem } from 'mai-ui/dist/components/list';
import { View, ViewContent, ViewHeader } from 'mai-ui/dist/components/view';
import { useListNav } from 'mai-ui/dist/hooks';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState } from 'preact/hooks';
import { useEffect } from 'react';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import { usePlayer } from '../contexts/playerContext';
import { Core } from '../services/core';

interface Props {
  listId: string;
  selectedItemId?: string;
}

export default function PlaylistViewer({
  listId,
  selectedItemId,
}: Props): VNode {
  const [list, setList] = useState<PlaylistExtended>();

  const player = usePlayer();

  useEffect(() => {
    Core.playlists.query({ id: Number(listId) }, true).then(setList);
  }, []);

  useListNav({
    initialSelectedId: list ? selectedItemId : undefined,
    onSelect: (itemId) => itemId && route(`/episode/${itemId}/info`),
  });

  async function moveEpisode(episodeId: number, change: -1 | 1) {
    if (!list) return;

    const newList = [...list.episodeIds];

    const newChange = change === -1 ? -1 : 2;
    const index = newList.findIndex((a) => a === episodeId);
    const newIndex =
      index + change < 0
        ? 0
        : index + change >= newList.length
        ? newList.length - 1
        : index + newChange;

    if (index === newIndex) return;

    newList.splice(newIndex, 0, episodeId);
    newList.splice(newIndex < index ? index + 1 : index, 1);
    await Core.playlists.update(list.id, { episodeIds: newList });

    const newEps = [...list.episodes];
    newEps.splice(newIndex, 0, list.episodes[index]);
    newEps.splice(newIndex < index ? index + 1 : index, 1);

    setList({
      ...list,
      episodeIds: newList,
      episodes: newEps,
    });
  }

  return (
    <View>
      <ViewHeader>{list?.title || 'List'}</ViewHeader>
      <ViewContent>
        {list?.episodes?.map((episode, i) => (
          <ListItem
            key={episode.id}
            primaryText={episode.title}
            secondaryText={episode.podcastTitle}
            imageUrl={episode.artwork}
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
            id: 'play',
            label: 'Play From Here',
            disabled: !selectedItemId,
            actionFn: () => {
              console.log('play from', selectedItemId, list);
              player.load(Number(selectedItemId), false, Number(listId));
            },
          },
          {
            id: 'moveUp',
            label: 'Move Up',
            disabled: !selectedItemId,
            actionFn: () => moveEpisode(Number(selectedItemId), -1),
          },
          {
            id: 'moveDown',
            label: 'Move Down',
            disabled: !selectedItemId,
            actionFn: () => moveEpisode(Number(selectedItemId), 1),
          },
          {
            id: 'remove',
            label: 'Remove From Playlist',
            disabled: !selectedItemId,
            actionFn: async () => {
              if (!list) return;

              const newIds = list.episodeIds.filter(
                (a) => a !== Number(selectedItemId)
              );
              await Core.playlists.update(list.id, { episodeIds: newIds });
              setList({
                ...list,
                episodeIds: newIds,
              });
            },
          },
          {
            id: 'edit',
            label: 'Edit Playlist',
            keepOpen: true,
            actionFn: () => route(`/playlists/${listId}/edit`),
          },
        ]}
      />
    </View>
  );
}
