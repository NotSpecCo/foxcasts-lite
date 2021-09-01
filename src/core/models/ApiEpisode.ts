export type ApiEpisode = {
  podexId?: number;
  guid: string;
  date: string; // ISO 8601
  title: string;
  description?: string;
  duration: number;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  chaptersUrl?: string;
  transcriptUrl?: string;
};
