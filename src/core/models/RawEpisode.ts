export type RawEpisode = {
  guid: string;
  date: string; // ISO 8601
  title: string;
  subtitle: string;
  description: string;
  duration: number;
  progress: number;
  fileSize: number;
  fileType: string;
  fileUrl: string;
};
