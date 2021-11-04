import { EpisodeExtended } from 'foxcasts-core/lib/types';

export type LineOptions = keyof Pick<
  EpisodeExtended,
  'title' | 'date' | 'description' | 'duration' | 'fileSize' | 'podcastTitle'
>;

export type FilterViewOptions = {
  primaryText: LineOptions | null;
  secondaryText: LineOptions | null;
  accentText: LineOptions | null;
  showCover: boolean;
};
