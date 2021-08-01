import { Episode } from './Episode';

type Cover = {
  30: string;
  60: string;
  100: string;
  600: string;
};

export type EpisodeExtended = Episode & {
  cover: Cover;
  podcastTitle: string;
};
