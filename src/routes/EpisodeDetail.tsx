import format from 'date-fns/format';
import { PlaybackStatus } from 'foxcasts-core/lib/enums';
import { EpisodeExtended } from 'foxcasts-core/lib/types';
import { formatFileSize, formatTime } from 'foxcasts-core/lib/utils';
import { Fragment, h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useDownloadManager } from '../contexts/DownloadManagerProvider';
import { usePlayer } from '../contexts/playerContext';
import { ArtworkBlur } from '../enums/artworkBlur';
import { ArtworkSize } from '../enums/artworkSize';
import { useArtwork } from '../hooks/useArtwork';
import { useBodyScroller } from '../hooks/useBodyScroller';
import { Core } from '../services/core';
import { AppBar, AppBarAction } from '../ui-components/appbar';
import { LabeledRow } from '../ui-components/LabeledRow';
import { Typography } from '../ui-components/Typography';
import { View, ViewContent } from '../ui-components/view';
import styles from './EpisodeDetail.module.css';

interface EpisodeDetailProps {
  episodeId: string;
}

export default function EpisodeDetail({
  episodeId,
}: EpisodeDetailProps): VNode {
  const [episode, setEpisode] = useState<EpisodeExtended>();

  const player = usePlayer();
  const { addToQueue } = useDownloadManager();

  const { artwork } = useArtwork(episode?.podcastId, {
    size: ArtworkSize.Large,
    blur: ArtworkBlur.Some,
  });

  useEffect(() => {
    Core.getEpisodeById(parseInt(episodeId, 10)).then((result) => {
      setEpisode(result);
    });
  }, [episodeId]);

  useBodyScroller({});

  function getActionList(): AppBarAction[] {
    if (!episode || episode?.fileType.startsWith('video')) {
      return [];
    }

    const options: AppBarAction[] = [
      {
        id: 'stream',
        label: episode?.isDownloaded ? 'Play' : 'Stream',
        actionFn: () => player.load(episode.id, false),
      },
      {
        id: 'download',
        label: 'Download',
        actionFn: () => addToQueue(episode.id),
      },
      {
        id: 'markPlayed',
        label: 'Mark as Played',
        actionFn: () =>
          Core.updateEpisode(episodeId, {
            playbackStatus: PlaybackStatus.Played,
            progress: episode.duration,
          }),
      },
      {
        id: 'markUnplayed',
        label: 'Mark as Unplayed',
        actionFn: () =>
          Core.updateEpisode(episodeId, {
            playbackStatus: PlaybackStatus.Unplayed,
            progress: 0,
          }),
      },
    ];

    if (episode && episode.progress > 0) {
      options.unshift({
        id: 'resume',
        label: `Resume at ${formatTime(episode.progress)}`,
        actionFn: () => player.load(Number(episodeId), true),
      });
    }

    return options;
  }

  return (
    <View
      backgroundImageUrl={artwork?.image}
      accentColor={episode?.accentColor}
      enableCustomColor={true}
    >
      <ViewContent>
        {episode?.fileType.startsWith('video') && (
          <div className={styles.accent}>
            Sorry, Foxcasts does not support video podcasts yet.
          </div>
        )}
        <Typography type="subtitle">{episode?.title}</Typography>
        {episode ? (
          <Fragment>
            <LabeledRow
              label="Published"
              text={
                episode
                  ? format(new Date(episode.date), 'ccc, MMMM do p')
                  : null
              }
            />
            <LabeledRow
              label="Progress"
              text={`${formatTime(episode.progress)} of ${
                formatTime(episode.duration) || 'Unknown'
              }`}
            />
            <LabeledRow
              label="File Size"
              text={
                episode.fileSize ? formatFileSize(episode?.fileSize) : 'Unknown'
              }
            />
            <LabeledRow
              label="Downloaded"
              text={episode.localFileUrl || 'No'}
            />
          </Fragment>
        ) : null}

        <Typography>{episode?.description}</Typography>
      </ViewContent>
      <AppBar actions={getActionList()} />
    </View>
  );
}
