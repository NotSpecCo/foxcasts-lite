import { PodcastExtended } from 'foxcasts-core/lib/types';
import { useEffect, useState } from 'preact/hooks';
import { ArtworkSize } from '../enums/artworkSize';
import { Core } from '../services/core';

type Return = {
  podcasts: PodcastExtended[];
  loading: boolean;
  error: boolean;
};

export function usePodcasts(): Return {
  const [data, setData] = useState<PodcastExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  async function getPodcasts(): Promise<PodcastExtended[]> {
    const result: PodcastExtended[] = [];
    const podcasts = await Core.getPodcasts();
    for (const podcast of podcasts) {
      const artwork = await Core.getArtwork(podcast.id, {
        size: ArtworkSize.Medium,
      });
      result.push({
        ...podcast,
        artwork,
      });
    }
    return result;
  }

  useEffect(() => {
    setLoading(true);
    setError(false);

    getPodcasts()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return { podcasts: data, loading, error };
}
