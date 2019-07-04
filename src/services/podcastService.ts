import { Episode, Podcast } from '../models';
import ApiService from './apiService';
import DatabaseService from './databaseService';

const apiService = new ApiService();
const databaseService = new DatabaseService();

class PodcastService {
    public async subscribe(podcastId: number): Promise<void> {
        try {
            const podcast = await apiService.getPodcastById(podcastId);
            const episodes = await apiService
                .getEpisodes(podcast.feedUrl)
                .then(results => this.formatEpisodes(podcast, results));

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

    public async checkForNewEpisodes() {
        console.group('Checking for new episodes.');
        const podcastIds = (await this.getSubscriptions()).map(o => o.id);

        for (const podcastId of podcastIds) {
            const podcast = await this.getPodcastById(podcastId, true);
            const latestEpisode = podcast.episodes![0];

            if (!latestEpisode) {
                return;
            }

            const newEpisodes = await apiService
                .getEpisodes(podcast.feedUrl, { numResults: 50, afterDate: latestEpisode.date })
                .then(results => this.formatEpisodes(podcast, results));

            console.log(
                `${podcast.title} - ${
                    newEpisodes.length
                } new episodes after ${latestEpisode.date.toISOString()}`
            );

            if (newEpisodes.length === 0) {
                continue;
            }

            await databaseService.addEpisodes(newEpisodes);
        }

        console.groupEnd();
    }

    private formatEpisodes(podcast: Podcast, episodes: Episode[]) {
        return episodes.map(
            episode =>
                ({
                    ...episode,
                    authorId: podcast.authorId,
                    author: episode.author || podcast.author,
                    podcastId: podcast.id
                } as Episode)
        );
    }
}

export default PodcastService;
