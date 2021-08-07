import { h, VNode } from 'preact';
import { route, Route, Router } from 'preact-router';
import { useEffect } from 'preact/hooks';
import { PlayerProvider } from '../contexts/playerContext';
import EpisodeDetail from '../routes/EpisodeDetail';
import Filter from '../routes/Filter';
import Player from '../routes/Player';
import PodcastDetail from '../routes/PodcastDetail';
import PodcastPreview from '../routes/PodcastPreview';
import Search from '../routes/Search';
import Podcasts from '../routes/Podcasts';
import { useNavKeys } from '../hooks/useNavKeys';
import { checkForUpdates } from '../core/services/podcasts';
import AppSettings from '../routes/AppSettings';
import { SettingsProvider, useSettings } from '../contexts/SettingsProvider';

export function AppWrapper(): VNode {
  return (
    <div id="preact_root">
      <SettingsProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
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

    // checkForUpdates();
  }, []);

  useEffect(() => {
    if (settings.darkTheme) {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', '#d04a11');
      document.body.classList.add('dark');
    } else {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', '#ec5817');
      document.body.classList.remove('dark');
    }
  }, [settings.darkTheme]);

  useEffect(() => {
    if (settings.compactLayout) {
      document.body.setAttribute('data-compact-layout', '');
    } else {
      document.body.removeAttribute('data-compact-layout');
    }
  }, [settings.compactLayout]);

  useNavKeys({
    Backspace: (ev) => {
      console.log('root backspace');
    },
  });

  return (
    <Router>
      <Route path="/search" component={Search} />
      <Route path="/search/:podcastStoreId" component={PodcastPreview} />
      <Route path="/podcast/:podcastId" component={PodcastDetail} />
      <Route path="/episode/:episodeId" component={EpisodeDetail} />
      <Route path="/filter/:filterId" component={Filter} />
      <Route path="/player" component={Player} />
      <Route path="/settings" component={AppSettings} />
      <Route path="/podcasts" component={Podcasts} default={true} />
    </Router>
  );
}
