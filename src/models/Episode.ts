export interface Episode {
  id: number;
  duration: number;
  progress: number;
  guid: string;
  date: Date;
  author: string;
  title: string;
  subTitle: string;
  description: string;
  fileSize: number;
  type: string;
  fileUrl: string;
  authorId: string;
  podcastId: number;
}
