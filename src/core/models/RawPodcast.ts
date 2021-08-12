import { RawEpisode } from './RawEpisode';

export type RawPodcast = {
  title: string;
  author: string;
  summary: string;
  description?: string;
  feedUrl: string;
  coverUrl: string;
  episodes: RawEpisode[];
};
