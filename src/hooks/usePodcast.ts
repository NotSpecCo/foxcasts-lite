import { Podcast } from 'foxcasts-core/lib/types';
import { useEffect, useState } from 'preact/hooks';
import { Core } from '../services/core';

export function usePodcast(podcastId: number | string | undefined) {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!podcastId) {
      setPodcast(null);
      setError(false);
      setLoading(false);
      return;
    }

    const id =
      typeof podcastId === 'string' ? parseInt(podcastId, 10) : podcastId;

    setLoading(true);
    Core.getPodcastById(id)
      .then((res) => {
        setPodcast(res);
        setError(false);
        setLoading(false);
      })
      .catch((err) => {
        console.log('usePodcast', err);
        setPodcast(null);
        setError(true);
        setLoading(false);
      });
  }, [podcastId]);

  return { podcast, loading, error };
}
