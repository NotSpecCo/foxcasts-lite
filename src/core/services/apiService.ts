import { ITunesPodcast, Podcast, RawEpisode } from '../models';
import { RawPodcast } from '../models/RawPodcast';
import { formatItunesPodcast } from '../utils';

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

function parseFeed(xmlString: string, episodeLimit = 50): RawPodcast {
  const xml = new DOMParser().parseFromString(xmlString, 'text/xml');

  // Get podcast info

  const podTitle =
    xml.querySelector('image>title')?.textContent ||
    xml.querySelector('title')?.textContent;
  const podAuthor = xml.getElementsByTagName('itunes:author')[0]?.textContent;
  const podArtwork = xml
    .getElementsByTagName('itunes:image')[0]
    ?.getAttribute('href');
  const podSummary = xml.getElementsByTagName('itunes:summary')[0]?.textContent;

  if (!podTitle || !podAuthor || !podArtwork) {
    throw new Error('Missing podcast info');
  }

  const result: RawPodcast = {
    title: podTitle,
    author: podAuthor,
    summary: podSummary || '',
    coverUrl: podArtwork,
    feedUrl: '',
    episodes: [],
  };

  if (episodeLimit === 0) {
    return result;
  }

  // Get episodes
  const recentEpisodes = Array.from(xml.getElementsByTagName('item'));

  recentEpisodes.slice(0, episodeLimit).forEach((rawEpisode) => {
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

      result.episodes.push(episode);
    } catch (err) {
      console.log('Error parsing episode', err, rawEpisode);
    }
  });

  return result;
}

const defaultHttpClient: HttpClient = {
  get: (url: string, contentType = 'application/json') => {
    const fullUrl =
      process.env.NODE_ENV === 'development'
        ? `http://localhost:8100/${url}`
        : url;

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

interface GetEpisodesOptions {
  numResults?: number;
  afterDate?: string; // ISO 8601
}

export class ApiService {
  private client: HttpClient;

  constructor(httpClient?: HttpClient) {
    this.client = httpClient || defaultHttpClient;
  }

  public async search(query: string): Promise<Podcast[]> {
    return this.client
      .get(`https://itunes.apple.com/search?media=podcast&term=${query}`)
      .then((res) => {
        return res.results.map((a: ITunesPodcast) => formatItunesPodcast(a));
      })
      .catch((err) => {
        console.log('Failed to search', err);
        throw new Error('Failed to search iTunes catalog.');
      });
  }

  public async getPodcastByFeed(
    feedUrl: string,
    episodes = 0
  ): Promise<RawPodcast> {
    return this.client
      .get(feedUrl, 'text/xml')
      .then((result) => {
        const podcast = parseFeed(result, episodes);
        podcast.feedUrl = feedUrl;
        return podcast;
      })
      .catch((err) => {
        console.error('Failed to get podcast', err);
        throw new Error('Failed to get episodes for podcast.');
      });
  }

  public async getCoverImage(imageUrl: string): Promise<Blob> {
    return this.client.get(imageUrl, 'image/*').catch((err) => {
      console.error('Failed to get cover', err);
      throw new Error('Failed to get cover for podcast.');
    });
  }

  public async getEpisodes(
    feedUrl: string,
    { numResults = 50, afterDate }: GetEpisodesOptions = {}
  ): Promise<RawEpisode[]> {
    return this.client
      .get(feedUrl, 'text/xml')
      .then((result) => parseFeed(result))
      .then(({ episodes }) => {
        if (!afterDate) {
          return episodes;
        }
        return episodes
          .filter((episode) => episode.date > afterDate)
          .slice(0, numResults);
      })
      .catch((err) => {
        console.error('Failed to get episodes', err);
        throw new Error('Failed to get episodes for podcast.');
      });
  }
}
