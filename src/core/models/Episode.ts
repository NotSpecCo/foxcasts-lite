import { Chapter } from './Chapter';

export type Episode = {
  id: number;
  podexId: number | null;
  guid: string;
  podcastId: number;
  date: string; // ISO 8601
  title: string;
  description: string;
  duration: number;
  progress: number;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  chaptersUrl?: string;
  chapters?: Chapter[];
  transcriptUrl?: string;
};
