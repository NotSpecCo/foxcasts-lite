import { Fragment, h, VNode } from 'preact';
import MiniPlayer from '../components/MiniPlayer';
import { usePlayer } from '../contexts/playerContext';
import { MenuOption, View } from '../ui-components';
import styles from './Player.module.css';

export default function Player(): VNode {
  const player = usePlayer();

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

  return (
    <View showHeader={false} actions={getActionList()} onAction={handleAction}>
      <div className={styles.content}>
        <MiniPlayer />
        {player.episode && (
          <Fragment>
            <div className={styles.title}>
              {player.episode && player.episode.title}
            </div>
            <img
              className={styles.logo}
              src={player.episode && player.episode.cover}
            />
            <div className={styles.author}>
              {player.episode && player.episode.podcastTitle}
            </div>
          </Fragment>
        )}
      </div>
    </View>
  );
}
