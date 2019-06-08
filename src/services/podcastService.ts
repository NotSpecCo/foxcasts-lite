import { Episode, Podcast } from '../models';
import ApiService from './apiService';
import DatabaseService from './databaseService';

const apiService = new ApiService();
const databaseService = new DatabaseService();

class PodcastService {
    public async subscribe(podcastId: number): Promise<void> {
        try {
            const podcast = await apiService.getPodcastById(podcastId);
            const episodes = await apiService.getEpisodes(podcast.feedUrl).then(results =>
                results.map(
                    episode =>
                        ({
                            ...episode,
                            authorId: podcast.authorId,
                            author: episode.author || podcast.author,
                            podcastId: podcast.id
                        } as Episode)
                )
            );

            await databaseService.addPodcast(podcast, episodes);
        } catch (err) {
            console.error('Error subscribing', err);
            throw new Error('Failed to subscribe to podcast.');
        }
    }

    public async unsubscribe(podcastId: number): Promise<void> {
        try {
            await databaseService.deletePodcast(podcastId);
        } catch (err) {
            console.error('Error unsubscribing', err);
            throw new Error('Failed to unsubscribe from podcast.');
        }
    }

    public async getSubscriptions(): Promise<Podcast[]> {
        return await databaseService.getPodcasts();
    }

    public async getPodcastById(id: number, includeEpisodes: boolean = false): Promise<Podcast> {
        return await databaseService.getPodcastById(id, includeEpisodes);
    }

    public async updateEpisode(episodeId: number, changes: any): Promise<void> {
        try {
            await databaseService.updateEpisode(episodeId, changes);
        } catch (err) {
            console.error(`Error updating episode ${episodeId}`, err);
        }
    }

    public async getEpisodeById(id: number): Promise<Episode> {
        try {
            return await databaseService.getEpisodeById(id);
        } catch (err) {
            console.error(`Failed to get episode ${id}`, err);
            throw err;
        }
    }
}

export default PodcastService;
