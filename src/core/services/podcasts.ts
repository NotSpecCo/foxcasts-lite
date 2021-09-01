import { Podcast, Episode, EpisodeExtended, EpisodeFilterId } from '../models';
import { NotFoundError } from '../utils/errors';
import api from './api';
import { DatabaseService } from './databaseService';

const databaseService = new DatabaseService();

// Podcasts

export async function subscribeByPodexId(podexId: number): Promise<void> {
  const existingSubscription = await databaseService
    .getPodcastByPodexId(podexId)
    .catch((err) => {
      if (err instanceof NotFoundError) return false;
      throw err;
    });
  if (existingSubscription) {
    console.log(`Already subscribed to ${podexId}`);
    return;
  }

  const podcast = await api.getPodcast(podexId);
  const episodes = await api.getEpisodes(podexId);
  const artwork = await api.getArtwork(podcast.artworkUrl, 100);

  await databaseService.addPodcast(podcast, episodes, artwork);
}

export async function subscribeByFeed(feedUrl: string): Promise<void> {
  const existingSubscription = await databaseService
    .getPodcastByFeed(feedUrl)
    .catch((err) => {
      if (err instanceof NotFoundError) return false;
      throw err;
    });
  if (existingSubscription) {
    console.log(`Already subscribed to ${feedUrl}`);
    return;
  }

  const podcast = await api.getPodcast(null, feedUrl);
  const episodes = await api.getEpisodes(null, feedUrl);
  const artwork = await api.getArtwork(podcast.artworkUrl, 100);

  await databaseService.addPodcast(podcast, episodes, artwork);
}

export async function unsubscribe(podcastId: number): Promise<void> {
  await databaseService.deletePodcast(podcastId);
}

export async function unsubscribeByPodexId(podexId: number): Promise<void> {
  const podcast = await databaseService
    .getPodcastByPodexId(podexId)
    .catch((err) => {
      if (err instanceof NotFoundError) return null;
      throw err;
    });

  if (!podcast) return;

  await databaseService.deletePodcast(podcast.id);
}

export async function unsubscribeByFeed(feedUrl: string): Promise<void> {
  const podcast = await databaseService
    .getPodcastByFeed(feedUrl)
    .catch((err) => {
      if (err instanceof NotFoundError) return null;
      throw err;
    });

  if (!podcast) return;

  await databaseService.deletePodcast(podcast.id);
}

export async function getAllPodcasts(): Promise<Podcast[]> {
  return await databaseService.getPodcasts();
}

export async function getPodcastById(podcastId: number): Promise<Podcast> {
  return await databaseService.getPodcastById(podcastId);
}

export async function getPodcastByPodexId(podexId: number): Promise<Podcast> {
  return await databaseService.getPodcastByPodexId(podexId);
}

export async function getPodcastByFeed(feedUrl: string): Promise<Podcast> {
  return await databaseService.getPodcastByFeed(feedUrl);
}

export async function checkForUpdates(): Promise<void> {
  const podcastIds = (await getAllPodcasts()).map((o) => o.id);

  for (const podcastId of podcastIds) {
    const podcast = await getPodcastById(podcastId);
    if (!podcast) continue;
    const latestEpisode = (
      await databaseService.getEpisodesByPodcastId(podcast.id, 1)
    )[0];

    if (!latestEpisode) {
      continue;
    }

    const newEpisodes = await api.getEpisodes(
      podcast.podexId,
      podcast.feedUrl,
      100,
      latestEpisode.date
    );

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
    cover: podcast.artwork,
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
  subscribe: subscribeByFeed,
  unsubscribe,
  getAllPodcasts,
  getPodcastById,
  checkForUpdates,
  getEpisodeById,
  getEpisodesByPodcastId,
  getEpisodesByFilter,
};
