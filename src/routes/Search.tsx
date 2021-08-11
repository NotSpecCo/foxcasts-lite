import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useRef, useState } from 'preact/hooks';
import { ApiService } from '../core/services/apiService';
import { ListItem, View } from '../ui-components';
import { setSelected } from '../utils/navigation';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import styles from './Search.module.css';
import { ITunesPodcast } from '../core/models';

const apiService = new ApiService();

interface SearchProps {
  q?: string;
  selectedItemId?: string;
}

export default function Search({
  q: queryParam,
  selectedItemId,
}: SearchProps): VNode {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<ITunesPodcast[]>([]);
  const searchbox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchbox.current?.focus();
    setResults([]);
    if (!queryParam) return;

    setQuery(queryParam);

    apiService
      .search(queryParam)
      .then((result) => setResults(result))
      .catch((err) => console.error(err));
  }, [queryParam]);

  // Restore scroll position
  useEffect(() => {
    setSelected(selectedItemId || 'search', true);
  }, [selectedItemId, results]);

  function viewPodcast(podcastStoreId: string | number): void {
    route(`/search/${podcastStoreId}`);
  }

  function setQueryParam(): void {
    route(query ? `/search?q=${query}` : '/search');
  }

  useDpad({
    onEnter: (itemId) => {
      if (itemId === 'search') {
        // searchbox.current?.blur();
        setQueryParam();
        return;
      }
      viewPodcast(itemId);
    },
    onChange: (itemId) => {
      if (itemId === 'search') {
        searchbox.current?.focus();
      } else {
        searchbox.current?.blur();
      }

      const params = [];
      if (queryParam) {
        params.push(`q=${queryParam}`);
      }
      if (itemId) {
        params.push(`selectedItemId=${itemId}`);
      }

      route(`/search?${params.join('&')}`, true);
    },
  });

  function handleQueryChange(ev: any): void {
    if (ev.target.value !== query) {
      setQuery(ev.target.value);
    }
  }

  function getCenterText(): string {
    if (document.activeElement === searchbox.current) {
      return 'Search';
    }

    if (selectedItemId) {
      return 'Select';
    }

    return '';
  }

  return (
    <View
      headerText="Search"
      centerMenuText={getCenterText()}
      rightMenuText="Search"
    >
      <input
        id="search"
        type="text"
        className={styles.searchBox}
        placeholder="Search..."
        value={query}
        ref={searchbox}
        onChange={handleQueryChange}
        onInput={handleQueryChange}
        data-selectable-priority={SelectablePriority.Low}
        data-selectable-id="search"
      />
      {results.map((result) => (
        <ListItem
          key={result.collectionId}
          itemId={result.collectionId}
          imageUrl={result.artworkUrl60}
          primaryText={result.collectionName}
          secondaryText={result.artistName}
          onClick={(): void => viewPodcast(result.collectionId)}
        />
      ))}
    </View>
  );
}
