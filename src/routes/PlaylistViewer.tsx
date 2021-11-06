import { EpisodeExtended, Playlist } from 'foxcasts-core/lib/types';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useState } from 'preact/hooks';
import { useEffect } from 'react';
import { usePlayer } from '../contexts/playerContext';
import { useListNav } from '../hooks/useListNav';
import { Core } from '../services/core';
import { AppBar } from '../ui-components/appbar';
import { ListItem } from '../ui-components/list';
import { View, ViewContent, ViewHeader } from '../ui-components/view';

interface Props {
  listId: string;
  selectedItemId?: string;
}

export default function PlaylistViewer({
  listId,
  selectedItemId,
}: Props): VNode {
  const [list, setList] = useState<Playlist>();
  const [episodes, setEpisodes] = useState<EpisodeExtended[]>();

  const player = usePlayer();

  useEffect(() => {
    Core.getPlaylist(Number(listId)).then((res) => {
      if (!res) return;

      setList(res);
      Core.getEpisodes({ episodeIds: res.episodeIds }).then((eps) => {
        setEpisodes(orderEpisodes(res.episodeIds, eps));
        setList(res);
      });
    });
  }, []);

  function orderEpisodes(ids: number[], eps: EpisodeExtended[]) {
    const episodeMap = eps.reduce((acc, episode) => {
      acc[episode.id] = episode;
      return acc;
    }, {} as { [key: number]: EpisodeExtended });

    return ids.map((id) => episodeMap[id]);
  }

  useEffect(() => {
    if (!list?.episodeIds || !episodes) return;
    setEpisodes(orderEpisodes(list.episodeIds, episodes));
  }, [list?.episodeIds]);

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
    await Core.updatePlaylist(list.id, { episodeIds: newList });
    setList({
      ...list,
      episodeIds: newList,
    });
  }

  return (
    <View>
      <ViewHeader>{list?.title || 'List'}</ViewHeader>
      <ViewContent>
        {list &&
          episodes?.map((episode, i) => (
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
              await Core.updatePlaylist(list.id, { episodeIds: newIds });
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