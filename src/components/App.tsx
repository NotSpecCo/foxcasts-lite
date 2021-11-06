import { PlaybackStatus } from 'foxcasts-core/lib/enums';
import kebabcase from 'lodash.kebabcase';
import { Fragment, h, VNode } from 'preact';
import { route, Route, Router } from 'preact-router';
import { useEffect } from 'preact/hooks';
import { DownloadManagerProvider } from '../contexts/DownloadManagerProvider';
import { PlayerProvider } from '../contexts/playerContext';
import { SettingsProvider, useSettings } from '../contexts/SettingsProvider';
import { ToastProvider } from '../contexts/ToastProvider';
import { ViewProvider } from '../contexts/ViewProvider';
import { FilterViewOptions, TextSize } from '../models';
import AppSettings from '../routes/AppSettings';
import Downloads from '../routes/Downloads';
import EpisodeDetail from '../routes/EpisodeDetail';
import EpisodesByDuration from '../routes/EpisodesByDuration';
import FilterListEditor from '../routes/FilterListEditor';
import FilterListViewer from '../routes/FilterListViewer';
import Filters from '../routes/Filters';
import Import from '../routes/Import';
import OpmlFiles from '../routes/OpmlFiles';
import Player from '../routes/Player';
import PlaylistEditor from '../routes/PlaylistEditor';
import Playlists from '../routes/Playlists';
import PlaylistViewer from '../routes/PlaylistViewer';
import PodcastDetail from '../routes/PodcastDetail';
import PodcastPreview from '../routes/PodcastPreview';
import Podcasts from '../routes/Podcasts';
import RecentEpisodes from '../routes/RecentEpisodes';
import Search from '../routes/Search';
import { Core } from '../services/core';
import { themes } from '../themes';
import { Toast } from '../ui-components/Toast';

export function AppWrapper(): VNode {
  return (
    <div id="preact_root">
      <SettingsProvider>
        <ToastProvider>
          <DownloadManagerProvider>
            <PlayerProvider>
              <ViewProvider>
                <App />
              </ViewProvider>
            </PlayerProvider>
          </DownloadManagerProvider>
        </ToastProvider>
      </SettingsProvider>
    </div>
  );
}

export default function App(): VNode {
  const { settings } = useSettings();

  useEffect(() => {
    if (window.location.href.includes('index.html')) {
      route('/podcasts');
    }

    // Core.health().then((res) => console.log(res));

    // Core.checkForUpdates();
    // fetch(
    //   'http://localhost:8100/https://api.foxcasts.com/podcasts?feedUrl=https://feed.syntax.fm/rss'
    // )
    //   .then((res) => console.log('res', res))
    //   .catch((err) => console.log('err', err));

    // Ensure default filters exist
    Core.filters.queryAll().then((res) => {
      if (res.length === 0) {
        Core.filters.add<FilterViewOptions>({
          title: 'In Progress',
          query: { playbackStatuses: [PlaybackStatus.InProgress] },
          isFavorite: 0,
          viewOptions: {
            primaryText: 'title',
            secondaryText: 'podcastTitle',
            accentText: null,
            showCover: false,
          },
        });
        Core.filters.add<FilterViewOptions>({
          title: 'Favorite Episodes',
          query: { isFavorite: 1 },
          isFavorite: 0,
          viewOptions: {
            primaryText: 'title',
            secondaryText: 'podcastTitle',
            accentText: null,
            showCover: false,
          },
        });
        Core.filters.add<FilterViewOptions>({
          title: 'Downloaded Episodes',
          query: { isDownloaded: 1 },
          isFavorite: 0,
          viewOptions: {
            primaryText: 'title',
            secondaryText: 'podcastTitle',
            accentText: null,
            showCover: false,
          },
        });
      }
    });
  }, []);

  useEffect(() => {
    // Theme
    const theme = themes.find((a) => a.id === settings.theme) || themes[0];
    for (const id in theme.values) {
      document.documentElement.style.setProperty(
        `--${kebabcase(id)}`,
        theme.values[id]
      );
    }
    document.documentElement.style.setProperty(
      '--app-accent-color',
      `#${settings.accentColor}`
    );
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme.values.headerBgColor);

    if (theme.settings.accentText) {
      document.documentElement.style.setProperty(
        '--accent-text-color',
        `#${settings.accentColor}`
      );
    }
    if (theme.settings.accentHighlight) {
      document.documentElement.style.setProperty(
        '--highlight-bg-color',
        `#${settings.accentColor}`
      );
    }
    if (theme.settings.accentHeader) {
      document.documentElement.style.setProperty(
        '--header-bg-color',
        `#${settings.accentColor}`
      );
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', `#${settings.accentColor}`);
    }

    const fontSize = {
      [TextSize.Smallest]: 9,
      [TextSize.Small]: 10,
      [TextSize.Medium]: 11,
      [TextSize.Large]: 12,
      [TextSize.Largest]: 13,
    };
    document.documentElement.style.setProperty(
      '--base-font-size',
      `${fontSize[settings.textSize]}px`
    );
  }, [settings]);

  return (
    <Fragment>
      <Router>
        <Route path="/search" component={Search} />
        <Route path="/podcast/preview" component={PodcastPreview} />
        <Route path="/podcast/:podcastId/:tabId" component={PodcastDetail} />
        <Route path="/episode/:episodeId/:tabId" component={EpisodeDetail} />
        <Route path="/playlists" component={Playlists} />
        <Route path="/playlists/:listId" component={PlaylistViewer} />
        <Route path="/playlists/:listId/edit" component={PlaylistEditor} />
        <Route path="/filters" component={Filters} />
        <Route path="/filters/:listId" component={FilterListViewer} />
        <Route path="/filters/:listId/edit" component={FilterListEditor} />
        <Route path="/filters/recent/:tabId" component={RecentEpisodes} />
        <Route path="/filters/duration/:tabId" component={EpisodesByDuration} />
        <Route path="/player/:tabId" component={Player} />
        <Route path="/settings/:tabId" component={AppSettings} />
        <Route path="/files" component={OpmlFiles} />
        <Route path="/import/:filePath" component={Import} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/podcasts" component={Podcasts} default={true} />
      </Router>
      <Toast />
    </Fragment>
  );
}
