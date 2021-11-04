import { formatTime } from 'foxcasts-core/lib/utils';
import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { PlaybackProgress, usePlayer } from '../contexts/playerContext';
import styles from './MiniPlayer.module.css';
import ProgressBar from './ProgressBar';

export default function MiniPlayer(): VNode {
  const [status, setStatus] = useState<PlaybackProgress>({
    playing: false,
    currentTime: 0,
    duration: 0,
  });

  const { getStatus } = usePlayer();

  useEffect(() => {
    const status = getStatus();
    setStatus(status);

    const timer = setInterval(() => {
      const status = getStatus();
      setStatus(status);
    }, 1000);

    return (): void => clearInterval(timer);
  }, []);

  return (
    <div className={styles.root}>
      <span>{formatTime(status.currentTime || 0)}</span>
      <ProgressBar
        className={styles.progressbar}
        position={(status.currentTime / status.duration) * 100 || 0}
      />
      <span>-{formatTime(status.duration - status.currentTime || 0)}</span>
    </div>
  );
}
