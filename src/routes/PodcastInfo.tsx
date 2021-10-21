import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { Podcast } from 'foxcasts-core/lib/types';
import { Core } from '../services/core';
import { Typography } from '../ui-components2/Typography';
import { useBodyScroller } from '../hooks/useBodyScroller';
import {
  View,
  ViewTabs,
  ViewContent,
  ViewHeader,
} from '../ui-components2/view';
import { AppBar } from '../ui-components2/appbar';
import styles from './PodcastInfo.module.css';

interface PodcastDetailProps {
  podcastId: string;
}

export default function PodcastInfo({ podcastId }: PodcastDetailProps): VNode {
  console.log('podinfo render', podcastId);

  const [podcast, setPodcast] = useState<Podcast>();
  console.log(podcast);

  useEffect(() => {
    Core.getPodcastById(parseInt(podcastId, 10)).then((result) =>
      setPodcast(result)
    );
  }, [podcastId]);

  useBodyScroller({});

  async function handleAction(action: string): Promise<void> {
    if (action === 'unsubscribe' && podcast) {
      await Core.unsubscribe(podcast.id)
        .then(() => route('/podcasts', true))
        .catch((err) => console.error('Failed to unsubscribe', err));
    }
  }

  return (
    <View backgroundImageUrl={podcast?.artwork}>
      <ViewHeader>{podcast?.title}</ViewHeader>
      <ViewTabs
        tabs={[
          { id: 'episodes', label: 'episodes' },
          { id: 'info', label: 'podcast' },
        ]}
        selectedId="info"
        onChange={(tabId): boolean =>
          route(`/podcast/${podcastId}/${tabId}`, true)
        }
      />
      <ViewContent>
        <div className={styles.titleContainer}>
          <img src={podcast?.artwork} alt="" />
          <div>
            <Typography type="title" padding="none">
              {podcast?.title}
            </Typography>
            <Typography padding="none" color="accent">
              {podcast?.author}
            </Typography>
          </div>
        </div>
        <Typography>{podcast?.description}</Typography>
      </ViewContent>
      <AppBar
        centerText="Select"
        actions={[{ id: 'unsubscribe', label: 'Unsubscribe' }]}
        onAction={handleAction}
      />
    </View>
  );
}
