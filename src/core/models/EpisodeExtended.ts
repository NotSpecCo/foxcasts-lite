import { Episode } from './Episode';

export type EpisodeExtended = Episode & {
  cover: string;
  podcastTitle: string;
};
