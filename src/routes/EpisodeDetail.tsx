import { Fragment, h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import styles from './EpisodeDetail.module.css';
import { usePlayer } from '../contexts/playerContext';
import { EpisodeExtended } from 'foxcasts-core/lib/types';
import { formatFileSize, formatTime } from 'foxcasts-core/lib/utils';
import { Core } from '../services/core';
import { useDownloadManager } from '../contexts/DownloadManagerProvider';
import { MenuOption } from '../ui-components2/Menu';
import { View, ViewContent } from '../ui-components2/view';
import { AppBar } from '../ui-components2/appbar';
import { useBodyScroller } from '../hooks/useBodyScroller';
import { PlaybackStatus } from 'foxcasts-core/lib/enums';
import { Row } from '../ui-components2/Row';
import { Typography } from '../ui-components2/Typography';

interface EpisodeDetailProps {
  episodeId: string;
}

export default function EpisodeDetail({
  episodeId,
}: EpisodeDetailProps): VNode {
  const [episode, setEpisode] = useState<EpisodeExtended>();
  console.log('episode', episode);

  const player = usePlayer();
  const { addToQueue } = useDownloadManager();

  useEffect(() => {
    Core.getEpisodeById(parseInt(episodeId, 10)).then((result) => {
      setEpisode(result);
    });
  }, [episodeId]);

  useBodyScroller({});

  function getActionList(): MenuOption[] {
    if (episode?.fileType.startsWith('video')) {
      return [];
    }

    const options = [
      episode?.isDownloaded
        ? { id: 'stream', label: 'Play' }
        : { id: 'stream', label: 'Stream' },
      { id: 'download', label: 'Download' },
      { id: 'markPlayed', label: 'Mark as Played' },
      { id: 'markUnplayed', label: 'Mark as Unplayed' },
    ];

    if (episode && episode.progress > 0) {
      options.unshift({
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
      case 'download':
        addToQueue(episode.id);
        break;
      case 'markPlayed':
        Core.updateEpisode(parseInt(episodeId, 10), {
          playbackStatus: PlaybackStatus.Played,
          progress: episode.duration,
        });
        break;
      case 'markUnplayed':
        Core.updateEpisode(parseInt(episodeId, 10), {
          playbackStatus: PlaybackStatus.Unplayed,
          progress: 0,
        });
        break;
    }
  }

  return (
    <View>
      <ViewContent>
        {episode?.fileType.startsWith('video') && (
          <div className={styles.accent}>
            Sorry, Foxcasts does not support video podcasts yet.
          </div>
        )}
        <Typography type="subtitle">{episode?.title}</Typography>
        {episode ? (
          <Fragment>
            <Row
              label="Published"
              text={
                episode ? new Date(episode.date).toLocaleDateString() : null
              }
            />
            <Row
              label="Progress"
              text={`${formatTime(episode.progress)} of ${
                formatTime(episode.duration) || 'Unknown'
              }`}
            />
            <Row
              label="File Size"
              text={
                episode.fileSize ? formatFileSize(episode?.fileSize) : 'Unknown'
              }
            />
            <Row label="Downloaded" text={episode.localFileUrl || 'No'} />
          </Fragment>
        ) : null}

        <Typography>{episode?.description}</Typography>
      </ViewContent>
      <AppBar actions={getActionList()} onAction={handleAction} />
    </View>
  );
}
