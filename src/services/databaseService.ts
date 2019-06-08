import Dexie from 'dexie';
import { Episode, EpisodeExtended, Podcast } from '../models';

class DatabaseService {
    private db: Dexie;

    constructor() {
        this.db = new Dexie('foxcasts');
        this.db.version(1).stores({
            podcasts: '++id, authorId, podcastId',
            episodes: '++id, authorId, podcastId, date, progress'
        });
    }

    public async addPodcast(podcast: Podcast, episodes: Episode[]): Promise<void> {
        const existingSubscription = await this.getPodcastById(podcast.id);
        if (existingSubscription) {
            console.log(`Already subscribed to ${podcast.title}. (ID: ${existingSubscription.id}`);
            return;
        }

        await this.db.transaction(
            'rw',
            this.db.table('podcasts'),
            this.db.table('episodes'),
            async () => {
                await this.db.table('podcasts').add(podcast);
                await this.db.table('episodes').bulkAdd(episodes);
            }
        );
    }

    public async deletePodcast(podcastId: number): Promise<void> {
        if (typeof podcastId === 'string') {
            podcastId = parseInt(podcastId, 10);
        }

        await this.db.transaction(
            'rw',
            this.db.table('podcasts'),
            this.db.table('episodes'),
            async () => {
                const episodes = await this.db
                    .table('episodes')
                    .where({ podcastId })
                    .toArray();
                const episodeIds = episodes.map(episode => episode.id);

                await this.db.table('podcasts').delete(podcastId);
                await this.db.table('episodes').bulkDelete(episodeIds);
            }
        );
    }

    public async getPodcastById(podcastId: number, includeEpisodes = false): Promise<Podcast> {
        if (typeof podcastId === 'string') {
            podcastId = parseInt(podcastId, 10);
        }

        const podcast: Podcast = await this.db.table('podcasts').get({ id: podcastId });

        if (podcast && includeEpisodes) {
            const episodes: Episode[] = await this.db
                .table('episodes')
                .where({ podcastId })
                // .sortBy('date')
                .toArray();
            podcast.episodes = episodes;
        }

        return podcast;
    }

    public async getPodcasts(): Promise<Podcast[]> {
        const podcasts: Podcast[] = await this.db
            .table('podcasts')
            .toCollection()
            .sortBy('title');
        return podcasts;
    }

    public async getPlaylist(playlist: string): Promise<EpisodeExtended[]> {
        const podcastCovers = await this.getPodcasts().then(podcasts => {
            return podcasts.reduce((coverMap: any, podcast) => {
                coverMap[podcast.id] = podcast.cover;
                return coverMap;
            }, {});
        });

        let episodes = [];

        switch (playlist) {
            case 'recent':
                episodes = await this.db
                    .table('episodes')
                    .orderBy('date')
                    .reverse()
                    .limit(20)
                    .toArray();
                break;
            case 'inProgress':
                episodes = await this.db
                    .table('episodes')
                    .where('progress')
                    .above(0)
                    .reverse()
                    .sortBy('date')
                    .then(results => results.filter(e => e.progress < e.duration));
                break;
            default:
                break;
        }

        const result = episodes.map(episode => ({
            ...episode,
            cover: podcastCovers[episode.podcastId]
        }));

        return result;
    }

    public async updateEpisode(episodeId: number, changes: any): Promise<Episode> {
        const updatedEpisode: Episode = (await this.db
            .table('episodes')
            .update(episodeId, changes)) as any; // TODO: update() returns number?
        return updatedEpisode;
    }

    public async getEpisodeById(episodeId: number): Promise<Episode> {
        if (typeof episodeId === 'string') {
            episodeId = parseInt(episodeId, 10);
        }

        const episode: Episode = await this.db.table('episodes').get({ id: episodeId });

        return episode;
    }
}

export default DatabaseService;
