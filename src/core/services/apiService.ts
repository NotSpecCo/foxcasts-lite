import { Episode, ITunesPodcast, Podcast, RawEpisode } from '../models';
import { formatPodcast } from '../utils';

interface HttpClient {
  get: (url: string, contentType?: string) => Promise<any>;
}

function getDurationInSeconds(duration: string): number {
  if (!duration.includes(':')) {
    return parseInt(duration, 10);
  }

  const parts = duration.split(':').reverse();

  let seconds = parseInt(parts[0], 10);
  seconds += parts[1] ? parseInt(parts[1], 10) * 60 : 0;
  seconds += parts[2] ? parseInt(parts[2], 10) * 60 * 60 : 0;

  return seconds;
}

function parseXmlEpisodes(xmlString: string, limit = 50): RawEpisode[] {
  const xml = new DOMParser().parseFromString(xmlString, 'text/xml');

  const recentEpisodes = Array.from(xml.getElementsByTagName('item'));

  const episodes: RawEpisode[] = [];

  recentEpisodes.slice(0, limit).forEach((rawEpisode) => {
    const descriptionNode =
      rawEpisode.getElementsByTagName('itunes:description')[0] ||
      rawEpisode.getElementsByTagName('description')[0];
    const titleNode =
      rawEpisode.getElementsByTagName('itunes:title')[0] ||
      rawEpisode.getElementsByTagName('title')[0];
    const subTitleNode =
      rawEpisode.getElementsByTagName('itunes:subtitle')[0] ||
      rawEpisode.getElementsByTagName('subtitle')[0];
    const durationNode =
      rawEpisode.getElementsByTagName('itunes:duration')[0] ||
      rawEpisode.getElementsByTagName('duration')[0];

    try {
      const episode: RawEpisode = {
        guid: rawEpisode.getElementsByTagName('guid')[0].textContent,
        title: titleNode.textContent,
        subtitle: subTitleNode?.textContent,
        date: new Date(
          rawEpisode.getElementsByTagName('pubDate')[0].textContent as string
        ).toISOString(),
        duration: getDurationInSeconds(durationNode.textContent || ''),
        progress: 0,
        description: descriptionNode?.textContent,
        fileSize: parseInt(
          rawEpisode
            .getElementsByTagName('enclosure')[0]
            .getAttribute('length') as string,
          10
        ),
        fileType: rawEpisode
          .getElementsByTagName('enclosure')[0]
          .getAttribute('type'),
        fileUrl: rawEpisode
          .getElementsByTagName('enclosure')[0]
          .getAttribute('url'),
      } as RawEpisode;

      episodes.push(episode);
    } catch (err) {
      console.log('Error parsing episode', err, rawEpisode);
    }
  });

  return episodes;
}

const defaultHttpClient: HttpClient = {
  get: (url: string, contentType = 'application/json') => {
    const fullUrl =
      process.env.NODE_ENV === 'development'
        ? `http://localhost:8100/${url}`
        : url;

    return new Promise((resolve, reject) => {
      const xmlhttp = new (XMLHttpRequest as any)({ mozSystem: true });
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

interface GetEpisodesOptions {
  numResults?: number;
  afterDate?: string; // ISO 8601
}

export class ApiService {
  private client: HttpClient;

  constructor(httpClient?: HttpClient) {
    this.client = httpClient || defaultHttpClient;
  }

  public async search(query: string): Promise<ITunesPodcast[]> {
    return this.client
      .get(`https://itunes.apple.com/search?media=podcast&term=${query}`)
      .then((res: any) => res.results) // TODO: Use formatPodcast
      .catch((err) => {
        console.log('Failed to search', err);
        throw new Error('Failed to search iTunes catalog.');
      });
  }

  public async getEpisodes(
    feedUrl: string,
    { numResults = 50, afterDate }: GetEpisodesOptions = {}
  ): Promise<RawEpisode[]> {
    return this.client
      .get(feedUrl, 'text/xml')
      .then((result: string) => parseXmlEpisodes(result))
      .then((episodes) => {
        if (!afterDate) {
          return episodes;
        }
        return episodes.filter((episode) => episode.date > afterDate);
      })
      .then((episodes) => episodes.slice(0, numResults))
      .catch((err) => {
        console.error('Failed to get episodes', err);
        throw new Error('Failed to get episodes for podcast.');
      });
  }

  public async getPodcastById(podcastId: number): Promise<ITunesPodcast> {
    return this.client
      .get(`https://itunes.apple.com/lookup?id=${podcastId}`)
      .then((res) => res.results[0])
      .catch((err) => {
        console.log('Failed to get podcast', err);
        throw new Error('Failed to get podcast detail from iTunes.');
      });
  }
}
