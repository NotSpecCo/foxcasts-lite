import { Episode } from './Episode';

// type Cover = {
//   30: string;
//   60: string;
//   100: string;
//   600: string;
// };

export type Podcast = {
  id: number;
  storeId: number;
  title: string;
  author: string;
  // summary: string;
  // description: string;
  feedUrl: string;
  artworkUrl30: string;
  artworkUrl60: string;
  artworkUrl100: string;
  artworkUrl600: string;
  episodes?: Episode[];
};
