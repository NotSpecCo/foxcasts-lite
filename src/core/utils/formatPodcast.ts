import { ITunesPodcast, Podcast } from '../models';

export function formatPodcast(podcast: ITunesPodcast): Podcast {
  return {
    storeId: podcast.collectionId,
    title: podcast.collectionName,
    author: podcast.artistName,
    artworkUrl30: podcast.artworkUrl30,
    artworkUrl60: podcast.artworkUrl60,
    artworkUrl100: podcast.artworkUrl100,
    artworkUrl600: podcast.artworkUrl600,
    feedUrl: podcast.feedUrl,
  } as Podcast;
}
