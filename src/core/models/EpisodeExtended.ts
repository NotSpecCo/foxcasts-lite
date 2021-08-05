import { Episode } from './Episode';

export type EpisodeExtended = Episode & {
  artworkUrl30: string;
  artworkUrl60: string;
  artworkUrl100: string;
  artworkUrl600: string;
  podcastTitle: string;
};
