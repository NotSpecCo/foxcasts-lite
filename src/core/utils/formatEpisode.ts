import { ApiEpisode, Episode } from '../models';

export function fromApiEpisode(source: ApiEpisode): Omit<Episode, 'id'> {
  return {
    podexId: source.podexId || null,
    guid: source.guid,
    podcastId: 0,
    date: source.date, // ISO 8601
    title: source.title,
    description: source.description || '',
    duration: source.duration,
    progress: 0,
    fileSize: source.fileSize,
    fileType: source.fileType,
    fileUrl: source.fileUrl,
    chapters: undefined,
    chaptersUrl: source.chaptersUrl,
    transcriptUrl: source.transcriptUrl,
  };
}
