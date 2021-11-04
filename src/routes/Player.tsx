import { PlaybackStatus } from 'foxcasts-core/lib/enums';
import { formatTime } from 'foxcasts-core/lib/utils';
import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useMemo, useState } from 'preact/hooks';
import ProgressBar from '../components/ProgressBar';
import { PlaybackProgress, usePlayer } from '../contexts/playerContext';
import { useSettings } from '../contexts/SettingsProvider';
import { useView } from '../contexts/ViewProvider';
import { ArtworkSize } from '../enums/artworkSize';
import { useArtwork } from '../hooks/useArtwork';
import { useNavKeys } from '../hooks/useNavKeys';
import { Settings } from '../models';
import { Core } from '../services/core';
import { KaiOS } from '../services/kaios';
import { AppBar, AppBarAction } from '../ui-components/appbar';
import { Typography } from '../ui-components/Typography';
import { View, ViewContent } from '../ui-components/view';
import { ifClass, joinClasses } from '../utils/classes';
import styles from './Player.module.css';

export default function Player(): VNode {
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
      Core.updateEpisode(player.episode.id, {
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
      ArrowUp: () => KaiOS.system.volumeUp(),
      ArrowDown: () => KaiOS.system.volumeDown(),
      ArrowLeft: () => setStatus(player.jump(-settings.playbackSkipBack)),
      ArrowRight: () => setStatus(player.jump(settings.playbackSkipForward)),
      Enter: () => {
        if (!player.episode) {
          return;
        }
        status.playing ? setStatus(player.pause()) : setStatus(player.play());
      },
    },
    { disabled: view.appbarOpen }
  );

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
        <AppBar />
      </View>
    );
  }

  return (
    <View
      accentColor={player.episode.accentColor}
      backgroundImageUrl={artwork?.image}
      enableBackdrop={false}
    >
      <ViewContent>
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
      </ViewContent>
      <AppBar
        centerText={status.playing ? 'Pause' : 'Play'}
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
