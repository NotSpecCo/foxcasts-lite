import { ApiEpisode, ApiPodcast, Chapter, SearchResult } from '../models';
import { toBase64 } from '../utils';

function xhrFetch<T>(
  path: string,
  responseType: 'json' | 'text' | 'blob' = 'json'
): Promise<T> {
  const fullUrl =
    process.env.NODE_ENV === 'development'
      ? `http://localhost:8100/https://api.foxcasts.com/${path}`
      : `https://api.foxcasts.com/${path}`;

  return new Promise((resolve, reject) => {
    const xhr = new (XMLHttpRequest as any)({ mozSystem: true });
    if (responseType === 'blob') {
      xhr.responseType = 'blob';
    }
    xhr.addEventListener('load', () => {
      if (xhr.status >= 400) {
        return reject(`Failed to GET ${path}`);
      }

      if (responseType === 'json') {
        resolve(JSON.parse(xhr.response));
      } else {
        resolve(xhr.response);
      }
    });
    xhr.addEventListener('error', () => reject(`Failed to GET ${path}`));

    xhr.open('GET', fullUrl, true);
    xhr.send();
  });
}

export async function search(query: string): Promise<SearchResult[]> {
  const url = `podcasts/search?query=${query}`;
  return xhrFetch<SearchResult[]>(url).catch((err) => {
    console.log(`Failed to search at ${url}`, err);
    throw new Error('Failed to search.');
  });
}

export async function getPodcast(
  id?: number | null,
  feedUrl?: string | null
): Promise<ApiPodcast> {
  if (!id && !feedUrl) {
    throw new Error('Must provide an id or feedUrl');
  }
  const queries = [];
  if (id) {
    queries.push(`id=${id}`);
  }
  if (feedUrl) {
    queries.push(`feedUrl=${feedUrl}`);
  }

  const url = `podcasts?${queries.join('&')}`;
  return xhrFetch<ApiPodcast>(url).catch((err) => {
    console.log(`Failed to get podcast at ${url}`, err);
    throw new Error('Failed to get podcast.');
  });
}

export async function getEpisodes(
  podcastId?: number | null,
  feedUrl?: string | null,
  count = 25,
  since?: string
): Promise<ApiEpisode[]> {
  if (!podcastId && !feedUrl) {
    throw new Error('Must provide a podcastId or feedUrl');
  }
  const queries = [];
  if (podcastId) {
    queries.push(`podcastId=${podcastId}`);
  }
  if (feedUrl) {
    queries.push(`feedUrl=${feedUrl}`);
  }
  if (count !== undefined) {
    queries.push(`count=${count}`);
  }
  if (since) {
    queries.push(`since=${since}`);
  }

  const url = `episodes?${queries.join('&')}`;
  return xhrFetch<ApiEpisode[]>(url).catch((err) => {
    console.log(`Failed to get episodes at ${url}`, err);
    throw new Error('Failed to get episodes.');
  });
}

export async function getChapters(
  episodeId?: number | null,
  fileUrl?: string | null
): Promise<Chapter[]> {
  if (!episodeId && !fileUrl) {
    throw new Error('Must provide an episodeId or fileUrl');
  }
  const queries = [];
  if (episodeId) {
    queries.push(`episodeId=${episodeId}`);
  }
  if (fileUrl) {
    queries.push(`fileUrl=${fileUrl}`);
  }

  const url = `chapters?${queries.join('&')}`;
  return xhrFetch<Chapter[]>(url).catch((err) => {
    console.log(`Failed to get chapters at ${url}`, err);
    throw new Error('Failed to search iTunes catalog.');
  });
}

export async function getArtwork(
  imageUrl: string,
  size: number
): Promise<string> {
  const url = `artwork?imageUrl=${encodeURIComponent(imageUrl)}&size=${size}`;
  return xhrFetch<Blob>(url, 'blob')
    .then((res: Blob) => toBase64(res))
    .catch((err) => {
      console.log(`Failed to get artwork at ${url}`, err);
      throw new Error('Failed to get artwork.');
    });
}

export default {
  search,
  getPodcast,
  getEpisodes,
  getChapters,
  getArtwork,
};
