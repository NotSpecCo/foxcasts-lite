import { Fragment, h, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import { View } from '../ui-components';
import styles from './Import.module.css';
import { readFileAsText } from '../services/files';
import { Button } from '../ui-components/Button';
import { subscribe } from '../core/services/podcasts';

type Feed = {
  id: number;
  selected: boolean;
  title: string;
  feedUrl: string;
};

async function importFeedsFromFile(fileName: string): Promise<string> {
  if (!(navigator as any).getDeviceStorage) {
    console.log('Not running on a real device. Using example data.');
    const exampleData = await fetch('assets/example.opml').then((res) =>
      res.text()
    );
    return exampleData;
  }

  return new Promise((resolve, reject) => {
    const sdcard = (navigator as any).getDeviceStorage('sdcard');
    const request = sdcard.get(fileName);
    request.onsuccess = function (): void {
      resolve(readFileAsText(this.result));
    };
    request.onerror = function (): void {
      reject(this.error);
    };
  });
}

export default function Import(): VNode {
  const [podcasts, setPodcasts] = useState<Feed[]>([]);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string>();

  async function getFeeds(): Promise<void> {
    const opmlText = await importFeedsFromFile('podcasts.opml').catch((err) => {
      console.log('Failed to read file', err);
      setError(
        "Failed to find or read podcasts.opml. Please make sure it's on the root of your SD card."
      );
    });

    if (!opmlText) return;

    const xml = new DOMParser().parseFromString(opmlText, 'text/xml');
    const feeds: Feed[] = Array.from(
      xml.querySelectorAll('outline[xmlUrl]')
    ).map(
      (a, i) =>
        ({
          id: i,
          selected: true,
          title: a.getAttribute('text'),
          feedUrl: a.getAttribute('xmlUrl'),
        } as Feed)
    );
    setPodcasts(feeds);
  }

  useEffect(() => {
    getFeeds();
  }, []);

  async function subscribeToPodcasts(): Promise<void> {
    if (subscribing) return;

    setSubscribing(true);
    for (const podcast of podcasts.filter((a) => a.selected)) {
      console.log(`Subscribing to ${podcast.title}`);
      await subscribe(podcast.feedUrl)
        .then(() => console.log(`Subscribed to ${podcast.title}`))
        .catch((err) =>
          console.log(`Failed to subscribe to ${podcast.title}`, err)
        );
    }
    setSubscribing(false);
  }

  useDpad({
    onEnter: (itemId) => {
      if (itemId === 'btnImport') {
        subscribeToPodcasts();
        return;
      }

      setPodcasts(
        podcasts.map((podcast) => {
          if (podcast.id === parseInt(itemId, 10)) {
            podcast.selected = !podcast.selected;
          }
          return podcast;
        })
      );
    },
  });

  return (
    <View headerText="Import OPML">
      {error ? <div className={styles.message}>{error}</div> : null}
      {podcasts.length > 0 ? (
        <Fragment>
          <div className={styles.message}>
            Choose which podcasts you want, then click the{' '}
            <span className={styles.accent}>Import</span> button below.
          </div>
          {podcasts.map((podcast) => (
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
              disabled={subscribing}
            />
          </div>
        </Fragment>
      ) : null}
    </View>
  );
}
