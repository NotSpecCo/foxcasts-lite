import { h } from 'preact';
import { route } from 'preact-router';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useNavKeys } from '../hooks/useNavKeys';
import { ITunesSearchResult } from '../core/models';
import { ApiService } from '../core/services/apiService';
import { ListItem, View } from '../ui-components';
import { NavItem, wrapItems } from '../utils/navigation';
import { useDpad } from '../hooks/useDpad';
import styles from './Search.module.css';

const apiService = new ApiService();

interface SearchProps {
  q?: string;
}

export default function Search({ q: queryParam }: SearchProps): any {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<NavItem<ITunesSearchResult>[]>([]);
  const searchbox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchbox.current?.focus();
    setItems([]);
    if (!queryParam) return;

    setQuery(queryParam);
    searchbox.current?.blur();

    apiService
      .search(queryParam)
      .then((result) => setItems(wrapItems(result)))
      .catch((err) => console.error(err));
  }, [queryParam]);

  function viewPodcast(id: number): void {
    route(`/podcast/${id}/preview`);
  }

  function setQueryParam(): void {
    route(query ? `/search?q=${query}` : '/search');
  }

  useDpad({
    items,
    onEnter: (item) => viewPodcast(item.data.collectionId),
    onChange: (items) => setItems(items),
    options: { stopPropagation: true },
  });

  useNavKeys(
    {
      Enter: (ev: KeyboardEvent) => {
        if ((ev.target as HTMLElement).tagName === 'INPUT') {
          setQueryParam();
          ev.stopImmediatePropagation();
        }
      },
      ArrowUp: () => {
        const noneSelected = !items.some((a) => a.isSelected);
        if (noneSelected) {
          searchbox.current?.focus();
        }
      },
      ArrowDown: () => {
        const noneSelected = !items.some((a) => a.isSelected);
        if (!noneSelected) return;
        searchbox.current?.blur();
      },
    },
    { allowInInputs: true }
  );

  function handleQueryChange(ev: any): void {
    if (ev.target.value !== query) {
      setQuery(ev.target.value);
    }
  }

  function getCenterText(): string {
    if (document.activeElement === searchbox.current) {
      return 'Search';
    }

    if (items.some((a) => a.isSelected)) {
      return 'Select';
    }

    return '';
  }

  return (
    <View
      headerText="Search"
      centerMenuText={getCenterText()}
      showHeader={false}
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
      />
      {items.map((item) => (
        <ListItem
          key={item.data.collectionId}
          ref={item.ref}
          isSelected={item.isSelected}
          imageUrl={item.data.artworkUrl60}
          primaryText={item.data.collectionName}
          secondaryText={item.data.artistName}
          onClick={(): void => viewPodcast(item.data.collectionId)}
        />
      ))}
    </View>
  );
}
