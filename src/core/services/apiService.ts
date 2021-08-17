import { RawEpisode, SearchResult } from '../models';
import { RawPodcast } from '../models/RawPodcast';
import { toBase64 } from '../utils';

interface HttpClient {
  get: (url: string, contentType?: string) => Promise<any>;
}

const defaultHttpClient: HttpClient = {
  get: (url: string, contentType = 'application/json') => {
    const fullUrl =
      process.env.NODE_ENV === 'development'
        ? `http://localhost:3000/api/${url}`
        : `https://foxcasts-api.vercel.app/api/${url}`;

    return new Promise((resolve, reject) => {
      const xmlhttp = new (XMLHttpRequest as any)({ mozSystem: true });
      if (contentType.includes('image')) {
        xmlhttp.responseType = 'blob';
      }
      xmlhttp.addEventListener('load', () => {
        if (xmlhttp.status >= 400) {
          return reject(`Failed to GET ${url}`);
        }

        const result =
          contentType === 'application/json'
            ? JSON.parse(xmlhttp.response)
            : xmlhttp.response;

        resolve(result);
      });
      xmlhttp.addEventListener('error', () => reject(`Failed to GET ${url}`));

      xmlhttp.open('GET', fullUrl, true);
      xmlhttp.setRequestHeader('Content-type', contentType);
      xmlhttp.send();
    });
  },
};

export class ApiService {
  private client: HttpClient;

  constructor(httpClient?: HttpClient) {
    this.client = httpClient || defaultHttpClient;
  }

  public async search(query: string): Promise<SearchResult[]> {
    return this.client.get(`search?searchText=${query}`).catch((err) => {
      console.log('Failed to search', err);
      throw new Error('Failed to search iTunes catalog.');
    });
  }

  public async getPodcastByFeed(
    feedUrl: string,
    episodes = 0,
    includeArtwork = false
  ): Promise<RawPodcast> {
    return this.client
      .get(
        `getFeed?feedUrl=${feedUrl}&episodesCount=${episodes}&includeArtwork=${includeArtwork}`
      )
      .catch((err) => {
        console.error('Failed to get podcast', err);
        throw new Error('Failed to get episodes for podcast.');
      });
  }

  public async getArtwork(imageUrl: string, size: number): Promise<string> {
    return this.client
      .get(`artwork?artworkUrl=${imageUrl}&size=${size}`, 'image')
      .then((res: Blob) => toBase64(res))
      .catch((err) => {
        console.error('Failed to get artwork', err);
        throw new Error('Failed to get artwork for podcast.');
      });
  }

  public async getEpisodes(
    feedUrl: string,
    afterDate: string
  ): Promise<RawEpisode[]> {
    return this.client
      .get(`getNewEpisodes?feedUrl=${feedUrl}&afterDate=${afterDate}`)
      .catch((err) => {
        console.error('Failed to get episodes', err);
        throw new Error('Failed to get episodes for podcast.');
      });
  }
}
