import { Podcast, Episode, EpisodeExtended, EpisodeFilterId } from '../models';
import { ApiService } from './apiService';
import { DatabaseService } from './databaseService';

const apiService = new ApiService();
const databaseService = new DatabaseService();

// Podcasts

export async function subscribe(podcastStoreId: number): Promise<void> {
  const podcast = await apiService.getPodcastById(podcastStoreId);
  const episodes = await apiService.getEpisodes(podcast.feedUrl);

  await databaseService.addPodcast(podcast, episodes);
}

export async function unsubscribe(
  podcastId: number,
  idType: 'db' | 'store' = 'db'
): Promise<void> {
  let id = podcastId;

  if (idType === 'store') {
    const podcast = await databaseService.getPodcastByStoreId(podcastId);
    id = podcast.id;
  }

  await databaseService.deletePodcast(id);
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

export async function getPodcastByStoreId(storeId: number): Promise<Podcast> {
  return await databaseService.getPodcastByStoreId(storeId);
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
    artworkUrl30: podcast.artworkUrl30,
    artworkUrl60: podcast.artworkUrl60,
    artworkUrl100: podcast.artworkUrl100,
    artworkUrl600: podcast.artworkUrl600,
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
  podcastId: number
): Promise<EpisodeExtended[]> {
  const podcast = await databaseService.getPodcastById(podcastId);
  const episodes = await databaseService.getEpisodesByPodcastId(podcastId);

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
