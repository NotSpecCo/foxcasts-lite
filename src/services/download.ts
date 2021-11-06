/* eslint-disable @typescript-eslint/no-explicit-any */
import { EpisodeExtended } from 'foxcasts-core/lib/types';
import { Subject } from 'rxjs';
import { Download, DownloadStatus } from '../models';
import { Core } from './core';
import { KaiOS } from './kaios';

type Chunk = {
  downloadId: number;
  part: number;
  startBytes: number;
  endBytes: number;
  bytes: number;
  totalBytes: number;
  data: ArrayBuffer;
};

type HttpClientOptions = {
  chunkByteLimit: number;
};

class HttpClient {
  public downloadId: number;
  public onProgress: Subject<Chunk> = new Subject<Chunk>();

  private options: HttpClientOptions;
  private xhr: XMLHttpRequest;

  constructor(downloadId: number, options?: HttpClientOptions) {
    this.options = {
      chunkByteLimit: 3145728,
      ...options,
    };
    this.downloadId = downloadId;
    const xhr: XMLHttpRequest = new (XMLHttpRequest as any)({
      mozSystem: true,
    });
    (xhr as any).responseType = 'moz-chunked-arraybuffer';
    this.xhr = xhr;
  }

  public download(downloadId: number, url: string): void {
    let chunk: Chunk = {
      downloadId,
      part: 1,
      startBytes: 0,
      endBytes: 0,
      bytes: 0,
      totalBytes: 0,
      data: new ArrayBuffer(0),
    };
    let savedBytes = 0;

    this.xhr.addEventListener('progress', (ev) => {
      const responseLength = this.xhr.response.byteLength;
      chunk.totalBytes = ev.total;

      let availableBytes = responseLength;
      while (availableBytes > 0) {
        const bytesNeeded = this.options.chunkByteLimit - chunk.data.byteLength;
        const bytesBefore = chunk.data.byteLength;

        chunk.data = this.appendChunk(
          chunk.data,
          this.xhr.response.slice(
            responseLength - availableBytes,
            responseLength - availableBytes + bytesNeeded
          )
        );
        chunk.bytes = chunk.data.byteLength;
        chunk.endBytes = chunk.startBytes + chunk.data.byteLength;

        availableBytes = availableBytes - (chunk.data.byteLength - bytesBefore);

        if (
          chunk.data.byteLength >= this.options.chunkByteLimit ||
          ev.total === ev.loaded
        ) {
          savedBytes = savedBytes + chunk.data.byteLength;
          this.onProgress.next(chunk);

          chunk = {
            downloadId,
            part: chunk.part + 1,
            startBytes: chunk.endBytes,
            endBytes: chunk.endBytes,
            bytes: 0,
            totalBytes: ev.total,
            data: new ArrayBuffer(0),
          };
        }
      }
    });

    this.xhr.addEventListener('load', () => {
      this.onProgress.complete();
    });
    this.xhr.addEventListener('abort', () =>
      console.log(`Download ${downloadId} aborted`)
    );
    this.xhr.addEventListener('error', () =>
      this.onProgress.error(new Error('File download failed'))
    );
    this.xhr.open('GET', url, true);
    this.xhr.send();
  }

  public abort(): void {
    this.xhr.abort();
  }

  private appendChunk(source: ArrayBuffer, newData?: ArrayBuffer): ArrayBuffer {
    if (!newData) {
      return source;
    }

    const tmp = new Uint8Array(source.byteLength + newData.byteLength);
    tmp.set(new Uint8Array(source), 0);
    tmp.set(new Uint8Array(newData), source.byteLength);
    return tmp.buffer;
  }
}

type DownloadManagerOptions = {
  chunkByteLimit: number;
};

export class DownloadManager {
  public onQueueChange = new Subject<Download[]>();

  private options: DownloadManagerOptions;
  // private db: Database;
  private httpClient?: HttpClient;
  private downloadQueue: Download[] = [];
  private chunkQueue: Chunk[] = [];
  private processingChunk = false;

  constructor(options?: DownloadManagerOptions) {
    this.options = {
      chunkByteLimit: 2097152,
      ...options,
    };

    Core.downloads.queryAll({}).then((res) => {
      this.downloadQueue = res;
      this.onQueueChange.next(this.downloadQueue);
    });
    Core.downloads.subscribeToChanges((change) => {
      const index = this.downloadQueue.findIndex((a) => a.id === change.id);
      switch (change.changeType) {
        case 'add':
          this.downloadQueue.push({
            ...change.updatedItem,
            id: change.id,
          });
          break;
        case 'update':
          if (index === -1) return;
          this.downloadQueue[index] = change.updatedItem;
          break;
        case 'delete':
          if (index === -1) return;
          this.downloadQueue.splice(index, 1);
          break;
      }

      this.onQueueChange.next(this.downloadQueue);
    });
  }

  public clearAllDownloads(): Promise<void> {
    return Core.downloads.deleteAll();
  }

  public async addToQueue(
    episode: Pick<
      EpisodeExtended,
      'id' | 'title' | 'remoteFileUrl' | 'podcastTitle'
    >
  ): Promise<void> {
    const download = await Core.downloads.query({ episodeId: episode.id });

    if (!download) {
      const storageName = KaiOS.storage.getActualStorageName('sdcard');
      if (!storageName) {
        throw new Error('Failed to get storage name');
      }
      const filePath = `/${storageName}/foxcasts/episode_${episode.id}.mp3`;
      await Core.downloads.add({
        episodeId: episode.id,
        episodeTitle: episode.title,
        podcastTitle: episode.podcastTitle,
        remoteFileUrl: episode.remoteFileUrl,
        localFileUrl: filePath,
      });
      await Core.episodes.update(episode.id, {
        localFileUrl: filePath,
        isDownloaded: 0,
      });
    } else if (
      download.status === DownloadStatus.Complete ||
      download.status === DownloadStatus.Error ||
      download.status === DownloadStatus.Cancelled
    ) {
      await Core.downloads.update(download.id, {
        currentBytes: 0,
        totalBytes: 0,
        status: DownloadStatus.Queued,
      });
    }

    await this.processNextFile();
  }

  public async removeFromQueue(episodeId: number): Promise<void> {
    const download = await Core.downloads.query({ episodeId });

    if (!download) {
      return;
    }

    if (download.status === DownloadStatus.Downloading) {
      this.httpClient?.abort();
    }

    await Core.downloads.delete([download.id]);
  }

  private async processNextChunk(): Promise<void> {
    if (this.processingChunk) return;
    this.processingChunk = true;

    const chunk = this.chunkQueue[0];
    const download = chunk
      ? await Core.downloads.query({ id: chunk.downloadId })
      : undefined;

    if (!chunk || !download) {
      this.processingChunk = false;
      return;
    }
    console.log(
      `Process chunk ${chunk.part} (Queue length ${this.chunkQueue.length})`
    );

    // Protect against messing with the wrong files
    if (!download.localFileUrl.includes('/foxcasts/')) {
      throw new Error(
        `Local file path must include foxcasts directory! Value: ${download.localFileUrl}`
      );
    }

    if (chunk.part === 1) {
      await KaiOS.storage.delete('sdcard', download.localFileUrl);
      await KaiOS.storage.addNamed('sdcard', new Blob(), download.localFileUrl);
    }

    await KaiOS.storage.appendNamed(
      'sdcard',
      new Blob([chunk.data]),
      download.localFileUrl
    );

    const data: Partial<Download> = {
      currentBytes: chunk.startBytes + chunk.bytes,
      totalBytes: chunk.totalBytes,
    };
    if (chunk.endBytes === chunk.totalBytes) {
      data.status = DownloadStatus.Complete;
      await Core.episodes.update(download.episodeId, {
        isDownloaded: 1,
      });
    }

    await Core.downloads.update(chunk.downloadId, data);

    this.chunkQueue.shift();
    this.processingChunk = false;
    if (
      this.chunkQueue.length === 0 &&
      data.status === DownloadStatus.Complete
    ) {
      this.processNextFile();
    } else {
      await this.processNextChunk();
    }
  }

  private async processNextFile(): Promise<void> {
    const inProgressDownload = await Core.downloads.query({
      status: DownloadStatus.Downloading,
    });
    if (inProgressDownload) return undefined;
    const nextDownload = await Core.downloads.get({
      status: DownloadStatus.Queued,
    });

    if (!nextDownload) {
      return;
    }

    await Core.downloads.update(nextDownload.id, {
      status: DownloadStatus.Downloading,
    });

    this.httpClient = new HttpClient(nextDownload.id, {
      chunkByteLimit: this.options.chunkByteLimit,
    });
    this.httpClient.onProgress.subscribe({
      next: (chunk) => {
        this.chunkQueue.push(chunk);
        this.processNextChunk();
      },
      error: async (err) => {
        console.log('progress error', err);
        await Core.downloads.update(nextDownload.id, {
          status: DownloadStatus.Error,
        });
        this.processNextFile();
      },
    });
    this.httpClient.download(nextDownload.id, nextDownload.remoteFileUrl);
  }
}
