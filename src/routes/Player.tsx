import { Fragment, h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import MiniPlayer from '../components/MiniPlayer';
import { usePlayer } from '../contexts/playerContext';
import { Chapter } from '../core/models';
import { getEpisodeChapters } from '../core/services/podcasts';
import { formatTime } from '../core/utils';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import { ListItem, MenuOption, View } from '../ui-components';
import styles from './Player.module.css';

export default function Player(): VNode {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);

  const player = usePlayer();

  useEffect(() => {
    const episode = player.episode;

    if (!episode) {
      setChapters(null);
      return;
    }

    if (episode?.chapters) {
      setChapters(episode.chapters);
    } else {
      getEpisodeChapters(episode.id, episode.podexId, episode.fileUrl).then(
        (res) => setChapters(res)
      );
    }
  }, [player.episode]);

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
  });

  return (
    <View
      showHeader={true}
      headerText={player.episode?.podcastTitle || 'Player'}
      actions={getActionList()}
      onAction={handleAction}
    >
      <div
        data-selectable-priority={SelectablePriority.Low}
        data-selectable-id="mini-player"
      >
        <MiniPlayer />
      </div>
      {player.episode && (
        <Fragment>
          <div className={styles.title}>
            {player.episode && player.episode.title}
          </div>
        </Fragment>
      )}
      {chapters &&
        chapters.map((chapter, i) => {
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
      {chapters?.length === 0 ? <div>{player.episode?.description}</div> : null}
    </View>
  );
}
