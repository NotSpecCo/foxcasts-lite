import { Podcast } from 'foxcasts-core/lib/types';
import { useEffect, useState } from 'preact/hooks';
import { Core } from '../services/core';

type Return = {
  podcasts: Podcast[];
  loading: boolean;
  error: boolean;
};

export function usePodcasts(): Return {
  const [data, setData] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    Core.getPodcasts()
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
