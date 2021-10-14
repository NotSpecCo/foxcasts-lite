import { Chapter, Podcast } from 'foxcasts-core/lib/types';
import { formatTime } from 'foxcasts-core/lib/utils';
import { Fragment, h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import Vibrant from 'node-vibrant';
import ProgressBar from '../components/ProgressBar';
import { PlaybackStatus, usePlayer } from '../contexts/playerContext';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import { useNavKeys } from '../hooks/useNavKeys';
import { Core } from '../services/core';
import { ListItem, MenuOption, View } from '../ui-components';
import { ifClass, joinClasses } from '../utils/classes';
import styles from './Player.module.css';
import { useSettings } from '../contexts/SettingsProvider';
import { clamp } from '../utils/clamp';

export default function Player(): VNode {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [browsingChapters, setBrowsingChapters] = useState(false);
  const [changingSpeed, setChangingSpeed] = useState(false);
  const [status, setStatus] = useState<PlaybackStatus>({
    playing: false,
    currentTime: 0,
    duration: 0,
  });
  const [accentColor, setAccentColor] = useState<string>();

  const player = usePlayer();
  const { settings, setSetting } = useSettings();

  useEffect(() => {
    const episode = player.episode;

    if (!episode) {
      setChapters(null);
      setPodcast(null);
      return;
    }

    if (episode?.chapters) {
      setChapters(episode.chapters);
    } else {
      Core.getEpisodeChapters(
        episode.id,
        episode.podexId,
        episode.fileUrl
      ).then((res) => setChapters(res));
    }

    Core.getPodcastById(episode.podcastId)
      .then((res) => {
        setPodcast(res);
        return Vibrant.from(res.artwork)
          .getPalette()
          .catch((err) => {
            console.log('Failed to get color palette', err.message);
            return null;
          });
      })
      .then((res) => setAccentColor(res?.Vibrant?.getHex()));

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
      Core.updateEpisode(player.episode.id, { progress: status.currentTime });
    }
  }, [player.episode, status.currentTime]);

  function handleAction(action: string): void {
    if (!player.episode) {
      return;
    }

    let newStatus;

    switch (action) {
      case 'play':
        newStatus = player.play();
        break;
      case 'pause':
        newStatus = player.pause();
        break;
      case 'stop':
        player.stop();
        break;
      case 'plus30':
        newStatus = player.jump(30);
        break;
      case 'minus30':
        newStatus = player.jump(-30);
        break;
      case 'speedDown':
        setSetting(
          'playbackSpeed',
          clamp(Math.round((settings.playbackSpeed - 0.2) * 100) / 100, 0.6, 4)
        );
        break;
      case 'speedUp':
        setSetting(
          'playbackSpeed',
          clamp(Math.round((settings.playbackSpeed + 0.2) * 100) / 100, 0.6, 4)
        );
        break;
      case 'detail':
        route(`/episode/${player.episode.id}`);
        break;
    }

    if (newStatus) {
      setStatus(newStatus);
    }
  }

  function getActionList(): MenuOption[] {
    return player.episode
      ? [
          status.playing
            ? { id: 'pause', label: 'Pause' }
            : { id: 'play', label: 'Play' },
          { id: 'stop', label: 'Stop' },
          { id: 'detail', label: 'View episode detail' },
        ]
      : [];
  }

  function handleClick(itemId: string): void {
    if (itemId.startsWith('chapter') && chapters) {
      const index = parseInt(itemId.split('_')[1], 10);
      player.goTo(Math.floor(chapters[index].startTime / 1000));
    }
  }

  useDpad({
    priority: SelectablePriority.Low,
    onEnter: handleClick,
    onChange: (itemId) => {
      setChangingSpeed(itemId === 'speed');
      setBrowsingChapters(!!itemId?.startsWith('chapter'));
    },
    options: { stopPropagation: false },
  });

  useNavKeys(
    {
      ArrowLeft: () =>
        changingSpeed ? handleAction('speedDown') : handleAction('minus30'),
      ArrowRight: () =>
        changingSpeed ? handleAction('speedUp') : handleAction('plus30'),
      Enter: () => {
        if (!player.episode) {
          return;
        }
        status.playing ? handleAction('pause') : handleAction('play');
      },
    },
    { disabled: browsingChapters }
  );

  return (
    <View
      showHeader={false}
      headerText={player.episode?.podcastTitle || 'Player'}
      centerMenuText={
        browsingChapters ? 'Select' : status.playing ? 'Pause' : 'Play'
      }
      accentColor={accentColor}
      actions={getActionList()}
      onAction={handleAction}
      backgroundImageUrl={podcast?.artworkUrl}
    >
      {player.episode ? (
        <Fragment>
          <div
            className={joinClasses(
              styles.player,
              ifClass(
                player?.episode?.fileType.startsWith('video'),
                styles.video
              )
            )}
          >
            <div
              data-selectable-priority={SelectablePriority.Low}
              data-selectable-id="top"
            />
            <div className={styles.gradient} />
            <div className={styles.info}>
              <div className={styles.author}>
                {player.episode?.podcastTitle}
              </div>
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
                  data-selectable-priority={SelectablePriority.Low}
                  data-selectable-id="speed"
                >{`${settings.playbackSpeed}x`}</span>
                {chapters && chapters.length > 0 ? (
                  <div className={styles.chevronDown} />
                ) : null}
              </div>
            </div>
          </div>
          <div className={styles.chapters}>
            {chapters?.map((chapter, i) => {
              let text = formatTime(chapter.startTime / 1000);
              if (chapter.endTime) {
                text = `${text} - ${formatTime(chapter.endTime / 1000)}`;
              }
              return (
                <ListItem
                  key={chapter.startTime}
                  itemId={`chapter_${i}`}
                  primaryText={chapter.title}
                  accentText={text}
                />
              );
            })}
          </div>
        </Fragment>
      ) : (
        <div className={styles.message}>Nothing is playing.</div>
      )}
    </View>
  );
}
