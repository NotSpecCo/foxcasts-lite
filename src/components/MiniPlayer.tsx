import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import ProgressBar from './ProgressBar';
import { PlaybackStatus, usePlayer } from '../contexts/playerContext';
import { formatTime } from '../core/utils';
import styles from './MiniPlayer.module.css';

export default function MiniPlayer(): VNode {
  const [status, setStatus] = useState<PlaybackStatus>({
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
