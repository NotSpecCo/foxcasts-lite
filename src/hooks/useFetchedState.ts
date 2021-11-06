import { useState } from 'preact/hooks';

type Return<T> = {
  getData: (getDataFn: () => Promise<T | undefined>) => Promise<void>;
  setData: (data: T | undefined) => void;
  data: T | undefined;
  loading: boolean;
  error: boolean;
};

export function useFetchedState<T>(initialValue?: T): Return<T> {
  const [data, setData] = useState<T | undefined>(initialValue);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  async function getData(getDataFn: () => Promise<T | undefined>) {
    setLoading(true);
    setError(false);
    setData(undefined);

    await getDataFn()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }

  return { data, loading, error, getData, setData };
}
