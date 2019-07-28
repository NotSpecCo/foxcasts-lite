import { ITunesSearchResult } from 'foxcasts-core/models';
import { ApiService } from 'foxcasts-core/services';
import { h } from 'preact';
import { route } from 'preact-router';
import { useContext, useEffect, useState } from 'preact/hooks';
import AppContext from '../../contexts/appContext';
import { useNavKeys } from '../../hooks/useNavKeys';
import { useShortcutKeys } from '../../hooks/useShortcutKeys';

const apiService = new ApiService();

interface SearchProps {
    q?: string;
}

export default function Search({ q: queryParam }: SearchProps) {
    const [query, setQuery] = useState<string | undefined>(undefined);
    const [results, setResults] = useState<ITunesSearchResult[]>([]);
    let searchBox: any;

    const { openNav } = useContext(AppContext);

    useNavKeys({
        SoftLeft: () => openNav(),
        SoftRight: () => navigateSearch(),
        Enter: () => navigateSearch()
    });

    useShortcutKeys(results, {}, result => {
        if (searchBox === document.activeElement) {
            return;
        }
        handlePodcastClick(result.collectionId)();
    });

    useEffect(() => {
        if (queryParam) {
            setQuery(queryParam);
            search(queryParam);
        }
    }, [queryParam]);

    const navigateSearch = () => {
        if (!query) {
            return;
        }
        route(`/search?q=${query}`);
    };

    const search = (override?: string) => {
        searchBox.blur();
        apiService
            .search(override || query!)
            .then(result => setResults(result))
            .catch(err => console.error(err));
    };

    const handleQueryChange = (ev: any) => {
        if (ev.target.value !== query) {
            setQuery(ev.target.value);
        }
    };

    const handlePodcastClick = (id: number) => () => {
        route(`/podcast/${id}/preview`);
    };

    return (
        <div class="view-container">
            <div class="kui-header">
                <h1 class="kui-h1">Search</h1>
            </div>
            <div class="view-content">
                <div class="kui-input-holder">
                    <input
                        type="text"
                        class="kui-input kui-text"
                        placeholder="Query"
                        value={query}
                        ref={input => (searchBox = input)}
                        onChange={handleQueryChange}
                        onInput={handleQueryChange}
                    />
                </div>
                <ul class="kui-list">
                    {results.map(podcast => (
                        <li
                            key={podcast.collectionId}
                            tabIndex={1}
                            onClick={handlePodcastClick(podcast.collectionId)}
                        >
                            <img class="kui-list-img" src={podcast.artworkUrl60} />
                            <div class="kui-list-cont">
                                <p class="kui-pri no-wrap">{podcast.collectionName}</p>
                                <p class="kui-sec no-wrap">{podcast.artistName}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div class="kui-software-key bottom">
                <h5 class="kui-h5">Nav</h5>
                <h5 class="kui-h5">SELECT</h5>
                <h5 class="kui-h5">Search</h5>
            </div>
        </div>
    );
}
