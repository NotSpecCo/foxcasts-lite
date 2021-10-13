import { DownloadStatus } from '.';

export type FileDownload = {
  downloadId: number;
  episodeId: number;
  remoteFileUrl: string;
  localFileUrl: string;
  episodeTitle: string;
  podcastTitle: string;
  currentBytes: number;
  totalBytes: number;
  status: DownloadStatus;
};
