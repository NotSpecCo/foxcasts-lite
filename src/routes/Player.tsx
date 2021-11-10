import { PlaybackStatus } from 'foxcasts-core/lib/enums';
import { Chapter, PlaylistExtended } from 'foxcasts-core/lib/types';
import { formatTime } from 'foxcasts-core/lib/utils';
import { AppBar, AppBarAction } from 'mai-ui/dist/components/appbar';
import { ListItem } from 'mai-ui/dist/components/list';
import { Typography } from 'mai-ui/dist/components/Typography';
import {
  View,
  ViewContent,
  ViewTab,
  ViewTabBar,
} from 'mai-ui/dist/components/view';
import { useView } from 'mai-ui/dist/contexts';
import { useListNav, useNavKeys } from 'mai-ui/dist/hooks';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { FoxcastsAppMenu } from '../components/FoxcastsAppMenu';
import ProgressBar from '../components/ProgressBar';
import { PlaybackProgress, usePlayer } from '../contexts/playerContext';
import { useSettings } from '../contexts/SettingsProvider';
import { ArtworkSize } from '../enums/artworkSize';
import { useArtwork } from '../hooks/useArtwork';
import { useFetchedState } from '../hooks/useFetchedState';
import { Settings } from '../models';
import { Core } from '../services/core';
import { ifClass, joinClasses } from '../utils/classes';
import styles from './Player.module.css';

type Props = {
  tabId: string;
};

export default function Player({ tabId }: Props): VNode {
  const playlist = useFetchedState<PlaylistExtended>();
  const chapters = useFetchedState<Chapter[]>();
  const [status, setStatus] = useState<PlaybackProgress>({
    playing: false,
    currentTime: 0,
    duration: 0,
  });

  const player = usePlayer();
  const { settings, setSetting } = useSettings();
  const view = useView();

  const { artwork } = useArtwork(player.episode?.podcastId, {
    size: ArtworkSize.Large,
  });

  useEffect(() => {
    if (tabId === 'playlist' && !playlist.data && player.playlistId) {
      playlist.getData(() =>
        Core.playlists.query({ id: player.playlistId! }, true)
      );
    } else if (tabId === 'chapters' && !chapters.data && player.episode) {
      chapters.getData(() => Core.episodes.getChapters(player.episode!.id));
    }
  }, [tabId]);

  useEffect(() => {
    const episode = player.episode;

    if (!episode) {
      return;
    }

    const status = player.getStatus();
    setStatus(status);

    const timer = setInterval(() => {
      const status = player.getStatus();
      setStatus(status);
    }, 1000);

    return (): void => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.episode]);

  useEffect(() => {
    if (player.episode) {
      Core.episodes.update(player.episode.id, {
        progress: status.currentTime,
        duration: status.duration,
        playbackStatus:
          status.currentTime > 0 && status.currentTime === status.duration
            ? PlaybackStatus.Played
            : PlaybackStatus.InProgress,
      });
    }
  }, [player.episode, status.currentTime]);

  const actionList: AppBarAction[] = useMemo(() => {
    if (!player.episode) {
      return [];
    }

    return [
      status.playing
        ? {
            id: 'pause',
            label: 'Pause',
            actionFn: () => setStatus(player.pause()),
          }
        : {
            id: 'play',
            label: 'Play',
            actionFn: () => setStatus(player.play()),
          },
      { id: 'stop', label: 'Stop', actionFn: () => player.stop() },
      {
        id: 'chapters',
        label: 'View chapters',
        keepOpen: true,
        actionFn: () => route(`/episode/${player.episode!.id}/chapters`),
      },
      {
        id: 'episode',
        label: 'View episode',
        keepOpen: true,
        actionFn: () => route(`/episode/${player.episode!.id}/info`),
      },
    ];
  }, [player.episode, status.playing]);

  useNavKeys(
    {
      Enter: () => {
        if (!player.episode) {
          return;
        } else if (tabId === 'player') {
          status.playing ? setStatus(player.pause()) : setStatus(player.play());
        } else if (tabId === 'playlist' && selectedId && playlist.data) {
          player.load(Number(selectedId), false, playlist.data.id);
        } else if (tabId === 'chapters' && selectedId && chapters.data) {
          player.goTo(
            Math.floor(chapters.data[Number(selectedId)].startTime / 1000)
          );
        }
      },
    },
    { disabled: view.appbarOpen || view.homeMenuOpen }
  );

  const { selectedId } = useListNav({
    updateRouteOnChange: false,
  });

  const playbackOptions = useMemo(() => {
    let current = 0.5;
    const options = [];
    while (current <= 4) {
      options.push({ id: current, label: current.toString() });
      current = Math.round((current + 0.1) * 100) / 100;
    }
    return options;
  }, []);

  if (!player.episode) {
    return (
      <View>
        <ViewContent>
          <Typography>Nothing playing</Typography>
        </ViewContent>
        <AppBar appMenuContent={<FoxcastsAppMenu />} />
      </View>
    );
  }

  return (
    <View
      accentColor={player.episode.accentColor}
      backgroundImageUrl={tabId === 'player' ? artwork?.image : undefined}
      enableBackdrop={false}
    >
      <ViewTabBar
        tabs={[
          { id: 'player', label: 'player' },
          { id: 'episode', label: 'episode' },
          { id: 'chapters', label: 'chapters' },
          { id: 'playlist', label: 'playlist' },
        ]}
        selectedId={tabId}
        onChange={(tabId) => route(`/player/${tabId}`, true)}
      />
      <ViewTab tabId="player" activeTabId={tabId}>
        <div
          className={joinClasses(
            styles.player,
            ifClass(player?.episode?.fileType.startsWith('video'), styles.video)
          )}
        >
          <div className={styles.gradient} />
          <div className={styles.info}>
            <div className={styles.author}>{player.episode?.podcastTitle}</div>
            <div className={styles.title}>{player.episode?.title}</div>
            <div className={styles.times}>
              <span className={styles.currentTime}>
                {formatTime(status.currentTime)}
              </span>
              <ProgressBar
                className={styles.progressbar}
                position={(status.currentTime / status.duration) * 100 || 0}
              />
              <span className={styles.duration}>
                {`${formatTime(status.duration)}`}
              </span>
              <div className={styles.spacer} />
              <span
                className={styles.speed}
              >{`${settings.playbackSpeed}x`}</span>
            </div>
          </div>
        </div>
      </ViewTab>
      <ViewTab tabId="episode" activeTabId={tabId}>
        <Typography>{player.episode?.description}</Typography>
      </ViewTab>
      <ViewTab tabId="chapters" activeTabId={tabId}>
        {chapters.loading && <Typography>Loading...</Typography>}
        {chapters.data?.length === 0 && <Typography>No chapters</Typography>}
        {chapters.data?.map((chapter, i) => {
          let text = formatTime(chapter.startTime / 1000);
          if (chapter.endTime) {
            text = `${text} - ${formatTime(chapter.endTime / 1000)}`;
          }
          return (
            <ListItem
              key={chapter.startTime}
              primaryText={chapter.title}
              accentText={text}
              selectable={{
                id: `${i}`,
                selected: selectedId === `${i}`,
              }}
            />
          );
        })}
      </ViewTab>
      <ViewTab tabId="playlist" activeTabId={tabId}>
        {playlist.loading && <Typography>Loading...</Typography>}
        {playlist.data?.episodes?.length === 0 && (
          <Typography>No episodes</Typography>
        )}
        {playlist.data?.episodes.map((episode) => (
          <ListItem
            primaryText={episode.title}
            secondaryText={episode.podcastTitle}
            selectable={{
              id: episode.id.toString(),
              selected: selectedId === episode.id.toString(),
            }}
          />
        ))}
      </ViewTab>
      <AppBar
        appMenuContent={<FoxcastsAppMenu />}
        centerText={
          tabId === 'player'
            ? status.playing
              ? 'Pause'
              : 'Play'
            : selectedId
            ? 'Select'
            : ''
        }
        actions={actionList}
        options={[
          {
            id: 'playbackSpeed',
            label: 'Playback Rate',
            currentValue: settings.playbackSpeed,
            options: playbackOptions,
          },
        ]}
        onOptionChange={(id, val) => setSetting(id as keyof Settings, val)}
      />
    </View>
  );
}
