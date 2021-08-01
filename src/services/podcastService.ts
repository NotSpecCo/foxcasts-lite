import { Episode } from '../models/Episode';
import { Podcast } from '../models/Podcast';
import { ApiService } from './apiService';
import { DatabaseService } from './databaseService';

export class PodcastService {
  private apiService = new ApiService();
  private databaseService = new DatabaseService();

  public async subscribe(podcastId: number): Promise<void> {
    try {
      const podcast = await this.apiService.getPodcastById(podcastId);
      const episodes = await this.apiService
        .getEpisodes(podcast.feedUrl)
        .then((results) => this.formatEpisodes(podcast, results));

      await this.databaseService.addPodcast(podcast, episodes);
    } catch (err) {
      console.error('Error subscribing', err);
      throw new Error('Failed to subscribe to podcast.');
    }
  }

  public async unsubscribe(podcastId: number): Promise<void> {
    try {
      await this.databaseService.deletePodcast(podcastId);
    } catch (err) {
      console.error('Error unsubscribing', err);
      throw new Error('Failed to unsubscribe from podcast.');
    }
  }

  public async getAll(): Promise<Podcast[]> {
    return await this.databaseService.getPodcasts();
  }

  public async getById(
    podcastId: number,
    includeEpisodes = false
  ): Promise<Podcast> {
    return await this.databaseService.getPodcastById(
      podcastId,
      includeEpisodes
    );
  }

  public async checkForUpdates() {
    const podcastIds = (await this.getAll()).map((o) => o.id);

    for (const podcastId of podcastIds) {
      const podcast = await this.getById(podcastId, true);
      const latestEpisode = podcast.episodes![0];

      if (!latestEpisode) {
        return;
      }

      const newEpisodes = await this.apiService
        .getEpisodes(podcast.feedUrl, {
          numResults: 50,
          afterDate: latestEpisode.date,
        })
        .then((results) => this.formatEpisodes(podcast, results));

      if (newEpisodes.length === 0) {
        continue;
      }

      await this.databaseService.addEpisodes(newEpisodes);
    }
  }

  private formatEpisodes(podcast: Podcast, episodes: Episode[]) {
    return episodes.map(
      (episode) =>
        ({
          ...episode,
          authorId: podcast.authorId,
          author: episode.author || podcast.author,
          podcastId: podcast.id,
        } as Episode)
    );
  }
}
