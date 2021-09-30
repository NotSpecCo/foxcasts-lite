import { Chapter, Podcast } from 'foxcasts-core/lib/types';
import { formatTime } from 'foxcasts-core/lib/utils';
import { Fragment, h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { PlaybackStatus, usePlayer } from '../contexts/playerContext';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import { useNavKeys } from '../hooks/useNavKeys';
import { Core } from '../services/core';
import { ListItem, MenuOption, View } from '../ui-components';
import styles from './Player.module.css';

export default function Player(): VNode {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [browsingChapters, setBrowsingChapters] = useState(false);
  const [status, setStatus] = useState<PlaybackStatus>({
    playing: false,
    currentTime: 0,
    duration: 0,
  });

  const player = usePlayer();

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

    Core.getPodcastById(episode.podcastId).then(setPodcast);

    const status = player.getStatus();
    setStatus(status);

    const timer = setInterval(() => {
      const status = player.getStatus();
      setStatus(status);
    }, 1000);

    return (): void => clearInterval(timer);
  }, [player.episode]);

  useEffect(() => {
    if (player.episode) {
      // console.log('update', player.episode.id, status.currentTime);
      Core.updateEpisode(player.episode.id, { progress: status.currentTime });
    }
  }, [player.episode, status.currentTime]);

  function handleAction(action: string): void {
    if (!player.episode) {
      return;
    }

    switch (action) {
      case 'play':
        player.play();
        break;
      case 'pause':
        player.pause();
        break;
      case 'stop':
        player.stop();
        break;
      case 'plus30':
        player.jump(30);
        break;
      case 'minus30':
        player.jump(-30);
        break;
    }
  }

  function getActionList(): MenuOption[] {
    const options = [
      player.playing
        ? { id: 'pause', label: 'Pause' }
        : { id: 'play', label: 'Play' },
      { id: 'stop', label: 'Stop' },
      { id: 'plus30', label: '+30 seconds' },
      { id: 'minus30', label: '-30 seconds' },
    ];

    return options;
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
    onChange: (itemId) => setBrowsingChapters(!!itemId?.startsWith('chapter')),
    options: { mode: 'updown' },
  });

  useNavKeys(
    {
      ArrowLeft: () => player.jump(-30),
      ArrowRight: () => player.jump(30),
      Enter: () => {
        if (!player.episode) {
          return;
        }
        status.playing ? player.pause() : player.play();
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
      actions={getActionList()}
      onAction={handleAction}
      backgroundImageUrl={podcast?.artworkUrl}
    >
      {player.episode ? (
        <Fragment>
          <div className={styles.player}>
            <div
              data-selectable-priority={SelectablePriority.Low}
              data-selectable-id="top"
            />
            <div className={styles.gradient}>
              <div className={styles.info}>
                <div className={styles.author}>
                  {player.episode?.podcastTitle}
                </div>
                <div className={styles.title}>{player.episode?.title}</div>
                <div className={styles.times}>
                  <span className={styles.currentTime}>
                    {formatTime(status.currentTime)}
                  </span>
                  <span className={styles.duration}>
                    {` / ${formatTime(status.duration)}`}
                  </span>
                  <div className={styles.flex} />
                  {chapters && chapters.length > 0 ? (
                    <div className={styles.chevronDown} />
                  ) : null}
                </div>
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
