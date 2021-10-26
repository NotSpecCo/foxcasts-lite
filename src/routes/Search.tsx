import { h, VNode } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import styles from './Search.module.css';
import { SearchResult } from 'foxcasts-core/lib/types';
import { Core } from '../services/core';
import { View, ViewContent } from '../ui-components/view';
import { ListItem } from '../ui-components/list';
import { useListNav } from '../hooks/useListNav';
import { Input } from '../ui-components/form';
import { AppBar } from '../ui-components/appbar';

interface SearchProps {
  q?: string;
  selectedItemId?: string;
}

export default function Search({
  q: queryParam,
  selectedItemId,
}: SearchProps): VNode {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    setResults([]);
    if (!queryParam) return;

    setQuery(queryParam);

    Core.searchPodcasts(queryParam)
      .then((result) => setResults(result))
      .catch((err) => console.error(err));
  }, [queryParam]);

  function viewPodcast(podcastStoreId: string | number): void {
    const podcast = results.find((a) => a.podexId == podcastStoreId);
    if (podcast?.feedUrl) {
      route(`/podcast/preview?podexId=${podcast.podexId}`);
    }
  }

  const { selectedId } = useListNav({
    initialSelectedId: results.length > 0 ? selectedItemId : undefined,
    updateRouteOnChange: true,
    onSelect: (itemId) => {
      if (!itemId) {
        return;
      } else if (itemId === 'search') {
        route(query ? `/search?q=${query}` : '/search', true);
      } else {
        viewPodcast(itemId);
      }
    },
  });

  function getCenterText(): string {
    if (selectedId === 'search') {
      return 'Search';
    }

    if (selectedItemId) {
      return 'Select';
    }

    return '';
  }

  return (
    <View>
      <Input
        className={styles.searchBox}
        value={query}
        placeholder="Search..."
        selectable={{
          id: 'search',
          selected: selectedId === 'search',
        }}
        onChange={(value): void => setQuery(value)}
      />
      <ViewContent>
        {results.map((result, i) => (
          <ListItem
            key={result.podexId}
            imageUrl={result.artworkUrl}
            primaryText={result.title}
            secondaryText={result.author}
            selectable={{
              id: result.podexId,
              shortcut: i + 1 <= 9 ? i + 1 : undefined,
              selected: result.podexId.toString() === selectedId,
            }}
          />
        ))}
      </ViewContent>
      <AppBar
        centerText={getCenterText()}
        actions={[
          {
            id: 'clear',
            label: 'Clear Search',
            actionFn: (): void => {
              setQuery('');
              route('/search?selectedItemId=search', true);
            },
          },
        ]}
      />
    </View>
  );
}
