import { Episode } from './Episode';

export type Podcast = {
  id: number;
  title: string;
  author: string;
  summary: string;
  feedUrl: string;
  coverSmall: string;
  coverLarge: string;
  episodes?: Episode[];
};
