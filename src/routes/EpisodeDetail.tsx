import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { EpisodeExtended } from '../core/models';
import { EpisodeService } from '../core/services';
import { formatTime } from '../core/utils';
import { MenuOption, View } from '../ui-components';
import styles from './EpisodeDetail.module.css';
import { usePlayer } from '../contexts/playerContext';

const episodeService = new EpisodeService();

interface EpisodeDetailProps {
  episodeId: string;
}

export default function EpisodeDetail({ episodeId }: EpisodeDetailProps): any {
  const [episode, setEpisode] = useState<EpisodeExtended>();

  const player = usePlayer();

  useEffect(() => {
    episodeService.getById(parseInt(episodeId, 10)).then((result) => {
      setEpisode(result);
    });
  }, [episodeId]);

  function getActionList(): MenuOption[] {
    const options = [
      { id: 'stream', label: 'Stream' },
      // { id: 'markPlayed', label: 'Mark as Played' },
      // { id: 'markUnplayed', label: 'Mark as Unplayed' }
    ];

    if (episode && episode.progress > 0) {
      options.push({
        id: 'resume',
        label: `Resume at ${formatTime(episode.progress)}`,
      });
    }

    return options;
  }

  function handleAction(action: string): void {
    if (!episode) return;

    switch (action) {
      case 'stream':
        player.load(episode.id, false);
        break;
      case 'resume':
        player.load(episode.id, true);
        break;
    }
  }

  return (
    <View
      showHeader={false}
      rightMenuText="Actions"
      actions={getActionList()}
      onAction={handleAction}
    >
      <div className={styles.details}>
        {episode && (
          <img
            src={episode.cover[600] || episode.cover[100]}
            className={styles.logo}
          />
        )}
        <div className={styles.title}>{episode?.title}</div>
        <div className={styles.author}>{episode?.author}</div>
      </div>
    </View>
  );
}
