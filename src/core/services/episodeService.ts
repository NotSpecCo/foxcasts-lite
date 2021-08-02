import { EpisodeExtended, EpisodeFilterId } from '../models';
import { DatabaseService } from './databaseService';

export class EpisodeService {
  private dbService = new DatabaseService();

  public async getById(episodeId: number): Promise<EpisodeExtended> {
    const episode = await this.dbService.getEpisodeById(episodeId);
    const podcast = await this.dbService.getPodcastById(episode.podcastId);

    return {
      ...episode,
      cover: podcast.cover,
      podcastTitle: podcast.title,
    };
  }

  public async updateEpisode(episodeId: number, changes: any): Promise<void> {
    await this.dbService.updateEpisode(episodeId, changes);
  }

  public async getByPodcastId(podcastId: number): Promise<EpisodeExtended[]> {
    const podcast = await this.dbService.getPodcastById(podcastId);
    const episodes = await this.dbService.getEpisodesByPodcast(podcastId);

    return episodes.map((episode) => ({
      ...episode,
      cover: podcast.cover,
      podcastTitle: podcast.title,
    }));
  }

  public async getByFilter(
    filterId: EpisodeFilterId,
    limit = 30
  ): Promise<EpisodeExtended[]> {
    const podcastDetail = await this.dbService
      .getPodcasts()
      .then((podcasts) => {
        return podcasts.reduce((coverMap: any, podcast) => {
          coverMap[podcast.id] = {
            title: podcast.title,
            cover: podcast.cover,
          };
          return coverMap;
        }, {});
      });

    const episodes = await this.dbService.getEpisodesByFilter(filterId, limit);

    return episodes.map((episode) => ({
      ...episode,
      cover: podcastDetail[episode.podcastId].cover,
      podcastTitle: podcastDetail[episode.podcastId].title,
    }));
  }
}
