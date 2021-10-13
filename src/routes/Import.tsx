import { h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import { View } from '../ui-components';
import styles from './Import.module.css';
import { Button } from '../ui-components/Button';
import { Core } from '../services/core';
import { OPML } from '../services/opml';
import { Typography } from '../ui-components/Typography';
import { route } from 'preact-router';

type Feed = {
  id: number;
  selected: boolean;
  title: string;
  feedUrl: string;
};

interface Props {
  filePath: string;
}

export default function Import(props: Props): VNode {
  const [feeds, setFeeds] = useState<Feed[]>();
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    OPML.openFile(props.filePath).then(({ data }) => {
      setFeeds(
        data.feeds.map((feed, i) => ({
          id: i,
          selected: true,
          title: feed.text,
          feedUrl: feed.xmlUrl,
        }))
      );
    });
  }, [props.filePath]);

  async function subscribeToPodcasts(): Promise<void> {
    if (subscribing || !feeds) return;

    setSubscribing(true);
    for (const podcast of feeds.filter((a) => a.selected)) {
      console.log(`Subscribing to ${podcast.title}`);
      await Core.subscribeByFeedUrl(podcast.feedUrl)
        .then(() => console.log(`Subscribed to ${podcast.title}`))
        .catch((err) =>
          console.log(`Failed to subscribe to ${podcast.title}`, err)
        );
    }
    setSubscribing(false);
    route('/podcasts');
  }

  useDpad({
    onEnter: (itemId) => {
      if (itemId === 'btnImport') {
        subscribeToPodcasts();
        return;
      }

      if (feeds) {
        setFeeds(
          feeds.map((podcast) => {
            if (podcast.id === parseInt(itemId, 10)) {
              podcast.selected = !podcast.selected;
            }
            return podcast;
          })
        );
      }
    },
  });

  return (
    <View headerText="Import OPML">
      <div className={styles.message}>
        Choose which podcasts you want, then click the{' '}
        <span className={styles.accent}>Import</span> button below.
      </div>
      {feeds === undefined && (
        <Typography align="center">Loading...</Typography>
      )}
      {feeds?.length === 0 && (
        <Typography align="center">No feeds found.</Typography>
      )}
      {feeds?.map((podcast) => (
        <div
          key={podcast.id}
          data-selectable-priority={SelectablePriority.Low}
          data-selectable-id={podcast.id}
          className={styles.row}
        >
          {podcast.title}
          <input type="checkbox" checked={podcast.selected} />
        </div>
      ))}
      <div className={styles.actions}>
        <Button
          text={subscribing ? 'Importing...' : 'Import'}
          data-selectable-priority={SelectablePriority.Low}
          data-selectable-id="btnImport"
          disabled={subscribing || feeds?.every((a) => !a.selected)}
        />
      </div>
    </View>
  );
}
