import { ITunesPodcast, Podcast } from '../models';
import { RawPodcast } from '../models/RawPodcast';

export function formatItunesPodcast(podcast: ITunesPodcast): Podcast {
  return {
    id: podcast.collectionId,
    title: podcast.collectionName,
    author: podcast.artistName,
    summary: '',
    feedUrl: podcast.feedUrl,
    coverSmall: podcast.artworkUrl100,
    coverLarge: podcast.artworkUrl600,
    episodes: [],
  };
}

export function formatRawPodcast(podcast: RawPodcast): Podcast {
  return {
    id: 0,
    title: podcast.title,
    author: podcast.author,
    summary: podcast.summary,
    feedUrl: podcast.feedUrl,
    coverSmall: podcast.coverUrl,
    coverLarge: podcast.coverUrl,
    episodes: [],
  };
}
