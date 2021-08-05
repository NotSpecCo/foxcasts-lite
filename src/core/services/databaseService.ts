import Dexie from 'dexie';
import {
  Podcast,
  Episode,
  EpisodeFilterId,
  EpisodeExtended,
  ITunesPodcast,
  RawEpisode,
} from '../models';
import { formatPodcast } from '../utils';

export class DatabaseService {
  private db: Dexie;

  constructor() {
    this.db = new Dexie('foxcasts');
    this.db.version(1).stores({
      podcasts: '++id, &storeId',
      episodes: '++id, &guid, podcastId, date, progress',
    });
  }

  //#region Podcasts

  public async addPodcast(
    rawPodcast: ITunesPodcast,
    rawEpisodes: RawEpisode[]
  ): Promise<void> {
    await this.db.transaction(
      'rw',
      this.db.table('podcasts'),
      this.db.table('episodes'),
      async () => {
        const podcastId = await this.db
          .table('podcasts')
          .add(formatPodcast(rawPodcast));
        const episodes: Episode[] = rawEpisodes.map(
          (rawEpisode) =>
            ({
              ...rawEpisode,
              podcastId,
            } as Episode)
        );
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
        const episodeIds = episodes.map((episode) => episode.id);

        await this.db.table('podcasts').delete(podcastId);
        await this.db.table('episodes').bulkDelete(episodeIds);
      }
    );
  }

  public async getPodcastById(
    podcastId: number,
    includeEpisodes = false
  ): Promise<Podcast> {
    if (typeof podcastId === 'string') {
      podcastId = parseInt(podcastId, 10);
    }

    const podcast: Podcast = await this.db
      .table('podcasts')
      .get({ id: podcastId });

    if (podcast && includeEpisodes) {
      const episodes: Episode[] = await this.db
        .table('episodes')
        .where({ podcastId })
        // .sortBy('date')
        .toArray()
        .then((eps) =>
          eps.sort((a, b) => {
            if (a.date > b.date) {
              return -1;
            }
            if (b.date > a.date) {
              return 1;
            }
            return 0;
          })
        );
      podcast.episodes = episodes;
    }

    return podcast;
  }

  public async getPodcastByStoreId(storeId: number): Promise<Podcast> {
    const podcast: Podcast = await this.db.table('podcasts').get({ storeId });
    return podcast;
  }

  public async getPodcasts(): Promise<Podcast[]> {
    return await this.db.table('podcasts').toCollection().sortBy('title');
  }

  //#endregion

  //#region Episodes

  public async addEpisode(
    podcastId: number,
    episode: RawEpisode
  ): Promise<void> {
    const existingEpisode = await this.getEpisodeByGuid(episode.guid);
    if (existingEpisode) {
      console.log(
        `Episode ${episode.guid} (${episode.title}) already exists in database.`
      );
      return;
    }
    await this.db.table('episodes').add({
      ...episode,
      podcastId,
    });
  }

  public async addEpisodes(
    podcastId: number,
    episodes: RawEpisode[]
  ): Promise<void> {
    for (const episode of episodes) {
      await this.addEpisode(podcastId, episode);
    }
  }

  public async getEpisodesByPodcastId(podcastId: number): Promise<Episode[]> {
    return await this.db
      .table('episodes')
      .where({ podcastId })
      // .sortBy('date')
      .toArray()
      .then((eps) =>
        eps.sort((a, b) => {
          if (a.date > b.date) {
            return -1;
          }
          if (b.date > a.date) {
            return 1;
          }
          return 0;
        })
      );
  }

  public async getEpisodesByFilter(
    filterId: EpisodeFilterId,
    limit = 30
  ): Promise<Episode[]> {
    let episodes = [];

    switch (filterId) {
      case 'recent':
        episodes = await this.db
          .table('episodes')
          .orderBy('date')
          .reverse()
          .limit(limit)
          .toArray();
        break;
      case 'inProgress':
        episodes = await this.db
          .table('episodes')
          .where('progress')
          .above(0)
          .reverse()
          .sortBy('date')
          .then((results) => results.filter((e) => e.progress < e.duration));
        break;
    }

    return episodes;
  }

  public async updateEpisode(
    episodeId: number,
    changes: any
  ): Promise<Episode> {
    return (await this.db.table('episodes').update(episodeId, changes)) as any; // TODO: update() returns number?
  }

  public async getEpisodeById(episodeId: number): Promise<Episode> {
    if (typeof episodeId === 'string') {
      episodeId = parseInt(episodeId, 10);
    }

    return await this.db.table('episodes').get({ id: episodeId });
  }

  public async getEpisodeByGuid(guid: string): Promise<Episode> {
    return await this.db.table('episodes').get({ guid });
  }

  //#endregion
}
