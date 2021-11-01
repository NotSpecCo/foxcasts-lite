import { createContext, h, VNode } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { asyncScheduler } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { ComponentBaseProps, Download } from '../models';
import { Core } from '../services/core';
import { DownloadManager } from '../services/download';

type DownloadManagerContextValue = {
  queue: Download[];
  addToQueue: (episodeId: number) => Promise<void>;
  removeFromQueue: (episodeId: number) => Promise<void>;
};

const defaultValue: DownloadManagerContextValue = {
  queue: [],
  addToQueue: () => Promise.resolve(),
  removeFromQueue: () => Promise.resolve(),
};

const DownloadManagerContext =
  createContext<DownloadManagerContextValue>(defaultValue);

type DownloadManagerProviderProps = ComponentBaseProps;

const manager = new DownloadManager();

export function DownloadManagerProvider(
  props: DownloadManagerProviderProps
): VNode {
  const [queue, setQueue] = useState<Download[]>([]);

  useEffect(() => {
    manager.onQueueChange
      .pipe(
        throttleTime(200, asyncScheduler, {
          leading: true,
          trailing: true,
        })
      )
      .subscribe({
        next: (val) => setQueue([...val]),
      });
  }, []);

  async function addToQueue(episodeId: number): Promise<void> {
    const episode = await Core.getEpisode({ id: episodeId });
    if (!episode) return;

    await manager.addToQueue(episode);
  }

  async function removeFromQueue(episodeId: number): Promise<void> {
    await manager.removeFromQueue(episodeId);
  }

  return (
    <DownloadManagerContext.Provider
      value={{
        queue,
        addToQueue,
        removeFromQueue,
      }}
    >
      {props.children}
    </DownloadManagerContext.Provider>
  );
}

export function useDownloadManager(): DownloadManagerContextValue {
  const context = useContext(DownloadManagerContext);
  if (context === undefined) {
    throw new Error(
      'useDownloadManager must be used within a DownloadManagerProvider'
    );
  }
  return context;
}
