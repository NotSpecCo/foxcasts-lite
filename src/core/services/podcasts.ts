import {
  Podcast,
  Episode,
  EpisodeExtended,
  EpisodeFilterId,
  RawPodcast,
} from '../models';
import { ApiService } from './apiService';
import { DatabaseService } from './databaseService';
import imageCompression from 'browser-image-compression';
import { toBase64 } from '../utils';

const apiService = new ApiService();
const databaseService = new DatabaseService();

// Podcasts

export async function subscribe(
  feedUrl: string,
  rawPodcast?: RawPodcast
): Promise<void> {
  const existingSubscription = await databaseService.getPodcastByFeed(feedUrl);
  if (existingSubscription) {
    console.log(`Already subscribed to ${feedUrl}`);
    return;
  }

  if (!rawPodcast) {
    rawPodcast = await apiService.getPodcastByFeed(feedUrl, 50);
  }

  const cover = await apiService.getCoverImage(rawPodcast.coverUrl);
  const coverLarge = await imageCompression(cover as File, {
    maxWidthOrHeight: 256,
    useWebWorker: false,
  });
  const coverSmall = await imageCompression(cover as File, {
    maxWidthOrHeight: 64,
    useWebWorker: false,
  });

  const podcast: Podcast = {
    id: 0,
    title: rawPodcast.title,
    author: rawPodcast.author,
    summary: rawPodcast.summary,
    feedUrl: rawPodcast.feedUrl,
    coverSmall: await toBase64(coverSmall),
    coverLarge: await toBase64(coverLarge),
  };

  await databaseService.addPodcast(podcast, rawPodcast.episodes);
}

export async function unsubscribe(podcastId: number): Promise<void> {
  await databaseService.deletePodcast(podcastId);
}

export async function unsubscribeByFeed(feedUrl: string): Promise<void> {
  const podcast = await databaseService.getPodcastByFeed(feedUrl);

  if (!podcast) return;

  await databaseService.deletePodcast(podcast.id);
}

export async function getAllPodcasts(): Promise<Podcast[]> {
  return await databaseService.getPodcasts();
}

export async function getPodcastById(
  podcastId: number,
  includeEpisodes = false
): Promise<Podcast> {
  return await databaseService.getPodcastById(podcastId, includeEpisodes);
}

export async function getPodcastByFeed(feedUrl: string): Promise<Podcast> {
  return await databaseService.getPodcastByFeed(feedUrl);
}

export async function checkForUpdates(): Promise<void> {
  const podcastIds = (await getAllPodcasts()).map((o) => o.id);

  for (const podcastId of podcastIds) {
    const podcast = await getPodcastById(podcastId, true);
    const latestEpisode = podcast.episodes?.[0];

    if (!latestEpisode) {
      return;
    }

    const newEpisodes = await apiService.getEpisodes(podcast.feedUrl, {
      numResults: 50,
      afterDate: latestEpisode.date,
    });

    if (newEpisodes.length === 0) {
      continue;
    }

    await databaseService.addEpisodes(podcastId, newEpisodes);
  }
}

// Episodes

function addPodcastInfoToEpisode(
  podcast: Podcast,
  episode: Episode
): EpisodeExtended {
  return {
    ...episode,
    podcastTitle: podcast.title,
    cover: podcast.coverSmall,
  };
}

export async function getEpisodeById(
  episodeId: number
): Promise<EpisodeExtended> {
  const episode = await databaseService.getEpisodeById(episodeId);
  const podcast = await databaseService.getPodcastById(episode.podcastId);

  return addPodcastInfoToEpisode(podcast, episode);
}

export async function getEpisodesByPodcastId(
  podcastId: number,
  limit = 30,
  offset = 0
): Promise<EpisodeExtended[]> {
  const podcast = await databaseService.getPodcastById(podcastId);
  const episodes = await databaseService.getEpisodesByPodcastId(
    podcastId,
    limit,
    offset
  );

  return episodes.map((episode) => addPodcastInfoToEpisode(podcast, episode));
}

export async function getEpisodesByFilter(
  filterId: EpisodeFilterId,
  limit = 30
): Promise<EpisodeExtended[]> {
  const [podcasts, episodes] = await Promise.all([
    databaseService.getPodcasts(),
    databaseService.getEpisodesByFilter(filterId, limit),
  ]);

  const podcastMap = podcasts.reduce((result, podcast) => {
    result[podcast.id] = podcast;
    return result;
  }, {} as { [podcastId: number]: Podcast });

  return episodes.map((episode) =>
    addPodcastInfoToEpisode(podcastMap[episode.podcastId], episode)
  );
}

export default {
  subscribe,
  unsubscribe,
  getAllPodcasts,
  getPodcastById,
  checkForUpdates,
  getEpisodeById,
  getEpisodesByPodcastId,
  getEpisodesByFilter,
};
