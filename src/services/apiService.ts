import { Episode } from '../models/Episode';
import { Podcast } from '../models/Podcast';
import formatPodcast from '../utils/formatPodcast';

interface HttpClient {
  get: (url: string, contentType?: string) => Promise<any>;
}

const getDurationInSeconds = (duration: string | number) => {
  if (typeof duration === 'number') {
    return duration;
  }

  if (!duration.includes(':')) {
    return parseInt(duration, 10);
  }

  const parts = duration.split(':').reverse();

  let seconds = parseInt(parts[0], 10);
  seconds += parts[1] ? parseInt(parts[1], 10) * 60 : 0;
  seconds += parts[2] ? parseInt(parts[2], 10) * 60 * 60 : 0;

  return seconds;
};

const parseXmlEpisodes = (xmlString: string): Episode[] => {
  const xml = new DOMParser().parseFromString(xmlString, 'text/xml');

  const recentEpisodes = Array.from(xml.getElementsByTagName('item'));

  const episodes: Episode[] = [];

  recentEpisodes.forEach((rawEpisode) => {
    const authorNode =
      rawEpisode.getElementsByTagName('itunes:author')[0] ||
      rawEpisode.getElementsByTagName('author')[0];
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
      const episode = {
        duration:
          durationNode &&
          getDurationInSeconds(durationNode.textContent as string),
        progress: 0,
        guid: rawEpisode.getElementsByTagName('guid')[0].textContent,
        date: new Date(
          rawEpisode.getElementsByTagName('pubDate')[0].textContent as string
        ),
        author: authorNode && authorNode.textContent,
        title: titleNode && titleNode.textContent,
        subTitle: subTitleNode && subTitleNode.textContent,
        description: descriptionNode && descriptionNode.textContent,
        fileSize: parseInt(
          rawEpisode
            .getElementsByTagName('enclosure')[0]
            .getAttribute('length')!,
          10
        ),
        type: rawEpisode
          .getElementsByTagName('enclosure')[0]
          .getAttribute('type'),
        fileUrl: rawEpisode
          .getElementsByTagName('enclosure')[0]
          .getAttribute('url'),
      } as Episode;

      episodes.push(episode);
    } catch (err) {
      console.log('Error parsing episode', err, rawEpisode);
    }
  });

  return episodes;
};

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
  afterDate?: Date;
}

export class ApiService {
  private client: HttpClient;

  constructor(httpClient?: HttpClient) {
    this.client = httpClient || defaultHttpClient;
  }

  public async search(query: string, { numResults = 25 } = {}) {
    return this.client
      .get(`https://itunes.apple.com/search?media=podcast&term=${query}`)
      .then((res: any) => res.results.slice(0, numResults)) // TODO: Use formatPodcast
      .catch((err) => {
        console.log('Failed to search', err);
        throw new Error('Failed to search iTunes catalog.');
      });
  }

  public async getEpisodes(
    feedUrl: string,
    { numResults = 25, afterDate }: GetEpisodesOptions = {}
  ): Promise<Episode[]> {
    return this.client
      .get(feedUrl, 'text/xml')
      .then((result: any) => parseXmlEpisodes(result))
      .then((episodes) => {
        if (!afterDate) {
          return episodes;
        }
        return episodes.filter((episode) => episode.date > afterDate!);
      })
      .then((episodes) => episodes.slice(0, numResults))
      .catch((err) => {
        console.error('Failed to get episodes', err);
        throw new Error('Failed to get episodes for podcast.');
      });
  }

  public async getPodcastById(podcastId: number): Promise<Podcast> {
    return this.client
      .get(`https://itunes.apple.com/lookup?id=${podcastId}`)
      .then((res) => formatPodcast(res.results[0]))
      .catch((err) => {
        console.log('Failed to get podcast', err);
        throw new Error('Failed to get podcast detail from iTunes.');
      });
  }
}
