/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject } from 'rxjs';
import { Dexie } from 'dexie';
import 'dexie-observable';
import { EpisodeExtended } from 'foxcasts-core/lib/types';
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

type DatabaseConfig = {
  name: string;
  version: number;
};

type ChangeEvent = {
  downloadId: number;
  changeType: 'add' | 'update' | 'delete';
  updatedItem: Download;
};

export class Database extends Dexie {
  private downloads: Dexie.Table<Download, number>;

  constructor(config: DatabaseConfig) {
    super(config.name);

    this.version(config.version).stores({
      downloads: '++id, &episodeId, status',
    });

    this.downloads = this.table('downloads');
  }

  onChange(callbackFn: (change: ChangeEvent) => void): void {
    this.on('changes', (changes) => {
      changes.forEach((change) => {
        switch (change.type) {
          case 1: // CREATED
            callbackFn({
              downloadId: change.key,
              changeType: 'add',
              updatedItem: change.obj,
            });
            break;
          case 2: // UPDATED
            callbackFn({
              downloadId: change.key,
              changeType: 'update',
              updatedItem: change.obj,
            });
            break;
          case 3: // DELETED
            callbackFn({
              downloadId: change.key,
              changeType: 'delete',
              updatedItem: change.oldObj,
            });
            break;
        }
      });
    });
  }

  clear(): Promise<void> {
    return this.downloads.clear();
  }

  addDownload(
    data: Pick<
      Download,
      | 'episodeId'
      | 'episodeTitle'
      | 'podcastTitle'
      | 'remoteFileUrl'
      | 'localFileUrl'
    >
  ): Promise<number> {
    return this.downloads.add({
      episodeId: data.episodeId,
      episodeTitle: data.episodeTitle,
      podcastTitle: data.podcastTitle,
      remoteFileUrl: data.remoteFileUrl,
      localFileUrl: data.localFileUrl,
      currentBytes: 0,
      totalBytes: 0,
      status: DownloadStatus.Queued,
    } as Download);
  }

  async updateDownload(
    downloadId: number,
    data: Partial<Download>
  ): Promise<boolean> {
    delete data.id;
    const updated = await this.downloads.update(downloadId, data);
    return !!updated;
  }

  getDownload(downloadId: number): Promise<Download | undefined> {
    return this.downloads.get({ id: downloadId });
  }

  getDownloadByEpisodeId(episodeId: number): Promise<Download | undefined> {
    return this.downloads.get({ episodeId });
  }

  deleteDownload(downloadId: number): Promise<void> {
    return this.downloads.delete(downloadId);
  }

  list(): Promise<Download[]> {
    return this.downloads.toCollection().toArray();
  }

  async checkForNextAvailable(): Promise<Download | undefined> {
    const inProgressDownload = await this.downloads.get({
      status: DownloadStatus.Downloading,
    });
    if (inProgressDownload) return undefined;
    return this.downloads.get({ status: DownloadStatus.Queued });
  }
}

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
  private db: Database;
  private httpClient?: HttpClient;
  private downloadQueue: Download[] = [];
  private chunkQueue: Chunk[] = [];
  private processingChunk = false;

  constructor(options?: DownloadManagerOptions) {
    this.options = {
      chunkByteLimit: 2097152,
      ...options,
    };

    this.db = new Database({ name: 'downloads', version: 1 });
    this.db.list().then((res) => {
      this.downloadQueue = res;
      this.onQueueChange.next(this.downloadQueue);
    });
    this.db.onChange((change) => {
      const index = this.downloadQueue.findIndex(
        (a) => a.id === change.downloadId
      );
      switch (change.changeType) {
        case 'add':
          this.downloadQueue.push({
            ...change.updatedItem,
            id: change.downloadId,
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
    return this.db.clear();
  }

  public async addToQueue(
    episode: Pick<
      EpisodeExtended,
      'id' | 'title' | 'remoteFileUrl' | 'podcastTitle'
    >
  ): Promise<void> {
    const download = await this.db.getDownloadByEpisodeId(episode.id);

    if (!download) {
      const storageName = KaiOS.storage.getActualStorageName('sdcard');
      if (!storageName) {
        throw new Error('Failed to get storage name');
      }
      const filePath = `/${storageName}/foxcasts/episode_${episode.id}.mp3`;
      await this.db.addDownload({
        episodeId: episode.id,
        episodeTitle: episode.title,
        podcastTitle: episode.podcastTitle,
        remoteFileUrl: episode.remoteFileUrl,
        localFileUrl: filePath,
      });
      await Core.updateEpisode(episode.id, {
        localFileUrl: filePath,
        isDownloaded: false,
      });
    } else if (
      download.status === DownloadStatus.Complete ||
      download.status === DownloadStatus.Error ||
      download.status === DownloadStatus.Cancelled
    ) {
      await this.db.updateDownload(download.id, {
        currentBytes: 0,
        totalBytes: 0,
        status: DownloadStatus.Queued,
      });
    }

    await this.processNextFile();
  }

  public async removeFromQueue(episodeId: number): Promise<void> {
    const download = await this.db.getDownloadByEpisodeId(episodeId);

    if (!download) {
      return;
    }

    if (download.status === DownloadStatus.Downloading) {
      this.httpClient?.abort();
    }

    await this.db.deleteDownload(download.id);
  }

  private async processNextChunk(): Promise<void> {
    if (this.processingChunk) return;
    this.processingChunk = true;

    const chunk = this.chunkQueue[0];
    const download = chunk
      ? await this.db.getDownload(chunk.downloadId)
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
      await Core.updateEpisode(download.episodeId, {
        isDownloaded: true,
      });
    }

    await this.db.updateDownload(chunk.downloadId, data);

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
    const nextDownload = await this.db.checkForNextAvailable();

    if (!nextDownload) {
      return;
    }

    await this.db.updateDownload(nextDownload.id, {
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
        await this.db.updateDownload(nextDownload.id, {
          status: DownloadStatus.Error,
        });
        this.processNextFile();
      },
    });
    this.httpClient.download(nextDownload.id, nextDownload.remoteFileUrl);
  }
}
