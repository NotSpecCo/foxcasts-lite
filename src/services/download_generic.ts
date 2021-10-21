// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Subject, throttleTime } from 'rxjs';
// import { Dexie } from 'dexie';
// import { appendFile, deleteFile, saveFile } from './files';
// import { Episode, EpisodeExtended } from 'foxcasts-core/lib/types';
// import { DownloadStatus } from '../models';
// import { Core } from './core';

// type Chunk = {
//   downloadId: number;
//   part: number;
//   startBytes: number;
//   endBytes: number;
//   bytes: number;
//   totalBytes: number;
//   data: ArrayBuffer;
// };

// type Download = {
//   id: number;
//   episodeId: number;
//   episodeTitle: string;
//   podcastTitle: string;
//   fileUrl: string;
//   currentBytes: number;
//   totalBytes: number;
// };

// type HttpClientOptions = {
//   chunkByteLimit: number;
// };

// type Callbacks = {
//   onProgress: (chunk: Chunk) => void;
//   onCompleted?: (result: {
//     bytesDownloaded: number;
//     bytesTotal: number;
//   }) => void;
//   onError?: (status: { status: number; statusText: string }) => void;
//   onAbort?: (result: { bytesDownloaded: number; bytesTotal: number }) => void;
// };

// class HttpClient {
//   public xhr: XMLHttpRequest;

//   private options: HttpClientOptions;
//   private callbacks: Callbacks;

//   constructor(callbacks: Callbacks, options?: HttpClientOptions) {
//     this.options = {
//       chunkByteLimit: 1048576,
//       ...options,
//     };
//     const xhr: XMLHttpRequest = new (XMLHttpRequest as any)({
//       mozSystem: true,
//     });
//     (xhr as any).responseType = 'moz-chunked-arraybuffer';
//     this.xhr = xhr;

//     this.callbacks = callbacks;
//   }

//   public download(downloadId: number, url: string): void {
//     let chunk: Chunk = {
//       downloadId,
//       part: 1,
//       startBytes: 0,
//       endBytes: 0,
//       bytes: 0,
//       totalBytes: 0,
//       data: new ArrayBuffer(0),
//     };
//     let bytesDownloaded = 0;
//     let bytesTotal = 0;

//     this.xhr.addEventListener('progress', (ev) => {
//       const responseLength = this.xhr.response.byteLength;
//       bytesTotal = ev.total;
//       chunk.totalBytes = ev.total;

//       let availableBytes = responseLength;
//       while (availableBytes > 0) {
//         const bytesNeeded = this.options.chunkByteLimit - chunk.data.byteLength;
//         const bytesBefore = chunk.data.byteLength;

//         chunk.data = this.appendChunk(
//           chunk.data,
//           this.xhr.response.slice(
//             responseLength - availableBytes,
//             responseLength - availableBytes + bytesNeeded
//           )
//         );
//         chunk.bytes = chunk.data.byteLength;
//         chunk.endBytes = chunk.startBytes + chunk.data.byteLength;

//         availableBytes = availableBytes - (chunk.data.byteLength - bytesBefore);

//         if (
//           chunk.data.byteLength >= this.options.chunkByteLimit ||
//           ev.total === ev.loaded
//         ) {
//           bytesDownloaded = bytesDownloaded + chunk.data.byteLength;
//           this.callbacks.onProgress(chunk);

//           chunk = {
//             downloadId,
//             part: chunk.part + 1,
//             startBytes: chunk.endBytes,
//             endBytes: chunk.endBytes,
//             bytes: 0,
//             totalBytes: ev.total,
//             data: new ArrayBuffer(0),
//           };
//         }
//       }

//       if (ev.total === ev.loaded)
//         console.log(
//           `Downloaded ${bytesDownloaded} of ${ev.total} bytes`,
//           bytesDownloaded === ev.total
//         );
//     });
//     this.xhr.addEventListener('load', () =>
//       this.callbacks.onCompleted?.({
//         bytesDownloaded,
//         bytesTotal,
//       })
//     );
//     this.xhr.addEventListener('abort', () =>
//       this.callbacks.onAbort?.({
//         bytesDownloaded,
//         bytesTotal,
//       })
//     );
//     this.xhr.addEventListener('error', () =>
//       this.callbacks.onError?.({
//         status: this.xhr.status,
//         statusText: this.xhr.statusText,
//       })
//     );
//     this.xhr.open('GET', url, true);
//     this.xhr.send();
//   }

//   public abort(): void {
//     this.xhr.abort();
//   }

//   private appendChunk(source: ArrayBuffer, newData?: ArrayBuffer): ArrayBuffer {
//     if (!newData) {
//       return source;
//     }

//     const tmp = new Uint8Array(source.byteLength + newData.byteLength);
//     tmp.set(new Uint8Array(source), 0);
//     tmp.set(new Uint8Array(newData), source.byteLength);
//     return tmp.buffer;
//   }
// }

// type DownloadManagerOptions = {
//   chunkByteLimit: number;
// };

// export type FileDownload = {
//   id: number;
//   remoteFileUrl: string;
//   localFileUrl: string;
//   currentBytes: number;
//   totalBytes: number;
//   status: DownloadStatus;
// };

// type DMCallbacks = {
//   onQueueChange?: (queue: FileDownload[]) => void;
//   onProgress: (status: FileDownload) => void;
//   onCompleted?: (status: FileDownload) => void;
//   onError?: (err: Error) => void;
// };

// export class DownloadManager {
//   private options: DownloadManagerOptions;
//   private callbacks: DMCallbacks;
//   private httpClient?: HttpClient;
//   private fileQueue: FileDownload[] = [];
//   private chunkQueue: Chunk[] = [];
//   private processingChunk = false;
//   private currentDownloadId = 0;

//   constructor(callbacks: DMCallbacks, options?: DownloadManagerOptions) {
//     this.options = {
//       chunkByteLimit: 1048576,
//       ...options,
//     };
//     this.callbacks = callbacks;
//   }

//   public addToQueue(remoteFileUrl: string, localFileUrl: string): number {
//     if (this.fileQueue.some((a) => a.remoteFileUrl === remoteFileUrl)) {
//       return 0;
//     }

//     this.fileQueue.push({
//       id: ++this.currentDownloadId,
//       remoteFileUrl,
//       localFileUrl,
//       currentBytes: 0,
//       totalBytes: 0,
//       status: DownloadStatus.Queued,
//     });

//     this.callbacks.onQueueChange?.(this.fileQueue);

//     this.processNextFile();
//     return this.currentDownloadId;
//   }

//   public removeFromQueue(downloadId: number): void {
//     const index = this.fileQueue.findIndex((a) => a.id === downloadId);
//     if (index === -1) return;

//     if (this.fileQueue[index].status === DownloadStatus.Downloading) {
//       this.httpClient?.abort();
//     }

//     this.fileQueue.splice(index, 1);
//     this.callbacks.onQueueChange?.(this.fileQueue);
//   }

//   private async processNextChunk(): Promise<void> {
//     const chunk = this.chunkQueue[0];
//     const download = this.fileQueue.find((a) => a.id === chunk?.downloadId);
//     if (!chunk || !download || this.processingChunk) return;

//     this.processingChunk = true;

//     // TODO: Some sort of protection against deleting wrong files

//     if (chunk.part === 1) {
//       await deleteFile(download.localFileUrl);
//       await saveFile(download.localFileUrl, new Blob());
//     }

//     await appendFile(download.localFileUrl, new Blob([chunk.data]));

//     const data: Partial<FileDownload> = {
//       currentBytes: chunk.startBytes + chunk.bytes,
//       totalBytes: chunk.totalBytes,
//     };
//     if (chunk.endBytes === chunk.totalBytes) {
//       data.status = DownloadStatus.Complete;
//     }
//     this.updateQueueItem(chunk.downloadId, data);

//     this.chunkQueue.shift();
//     this.processingChunk = false;
//     this.processNextChunk();
//   }

//   private async processNextFile(): Promise<void> {
//     const downloadInProgress = this.fileQueue.some(
//       (a) => a.status === DownloadStatus.Downloading
//     );
//     const download = this.fileQueue.filter(
//       (a) => a.status === DownloadStatus.Queued
//     )[0];

//     if (!download || downloadInProgress) {
//       return;
//     }

//     this.updateQueueItem(download.id, {
//       status: DownloadStatus.Downloading,
//     });

//     this.httpClient = new HttpClient(
//       {
//         onProgress: (chunk) => {
//           this.chunkQueue.push(chunk);
//           this.processNextChunk();
//         },
//         onCompleted: () => this.processNextFile(),
//         onError: () => {
//           this.updateQueueItem(download.id, {
//             status: DownloadStatus.Error,
//           });
//           this.processNextFile();
//         },
//       },
//       {
//         chunkByteLimit: this.options.chunkByteLimit,
//       }
//     );
//     this.httpClient.download(download.id, download.remoteFileUrl);
//   }

//   private updateQueueItem(
//     downloadId: number,
//     data: Partial<FileDownload>
//   ): void {
//     const index = this.fileQueue.findIndex((a) => a.id === downloadId);
//     if (index === -1) return;

//     this.fileQueue[index] = {
//       ...this.fileQueue[index],
//       ...data,
//     };

//     this.callbacks.onQueueChange?.(this.fileQueue);
//   }
// }
