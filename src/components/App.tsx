import { Fragment, h, VNode } from 'preact';
import { route, Route, Router } from 'preact-router';
import { useEffect } from 'preact/hooks';
import { PlayerProvider } from '../contexts/playerContext';
import EpisodeDetail from '../routes/EpisodeDetail';
import Filter from '../routes/Filter';
import Player from '../routes/Player';
import PodcastEpisodes from '../routes/PodcastEpisodes';
import PodcastPreview from '../routes/PodcastPreview';
import Search from '../routes/Search';
import Podcasts from '../routes/Podcasts';
import AppSettings from '../routes/AppSettings';
import Import from '../routes/Import';
import { SettingsProvider, useSettings } from '../contexts/SettingsProvider';
import { themes } from '../themes';
import { Core } from '../services/core';
import OpmlFiles from '../routes/OpmlFiles';
import { ToastProvider } from '../contexts/ToastProvider';
import { Toast } from '../ui-components/Toast';
import Downloads from '../routes/Downloads';
import { DownloadManagerProvider } from '../contexts/DownloadManagerProvider';
import PodcastInfo from '../routes/PodcastInfo';

export function AppWrapper(): VNode {
  return (
    <div id="preact_root">
      <SettingsProvider>
        <ToastProvider>
          <DownloadManagerProvider>
            <PlayerProvider>
              <App />
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
  }, []);

  useEffect(() => {
    // Theme
    const theme = themes.find((a) => a.id === settings.theme) || themes[0];
    for (const id in theme.values) {
      document.documentElement.style.setProperty(
        `--${theme.values[id].variable}`,
        theme.values[id].value
      );
    }
    document.documentElement.style.setProperty(
      '--app-accent-color',
      `#${settings.accentColor}`
    );
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme.values.headerBgColor.value);

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
    // document.documentElement.style.setProperty('--base-font-size', `10px`);
    if (theme.settings.accentHeader) {
      document.documentElement.style.setProperty(
        '--header-bg-color',
        `#${settings.accentColor}`
      );
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', `#${settings.accentColor}`);
    }

    // Layout
    document.documentElement.setAttribute('data-compact-layout', '');
    // if (settings.displayDensity === DisplayDensity.Compact) {
    // } else {
    //   document.documentElement.removeAttribute('data-compact-layout');
    // }
  }, [settings]);

  return (
    <Fragment>
      <Router>
        <Route path="/search" component={Search} />
        <Route path="/podcast/preview" component={PodcastPreview} />
        <Route
          path="/podcast/:podcastId/episodes"
          component={PodcastEpisodes}
        />
        <Route path="/podcast/:podcastId/info" component={PodcastInfo} />
        <Route path="/episode/:episodeId" component={EpisodeDetail} />
        <Route path="/filter/:filterId" component={Filter} />
        <Route path="/player" component={Player} />
        <Route path="/settings" component={AppSettings} />
        <Route path="/files" component={OpmlFiles} />
        <Route path="/import/:filePath" component={Import} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/podcasts" component={Podcasts} default={true} />
      </Router>
      <Toast />
    </Fragment>
  );
}
