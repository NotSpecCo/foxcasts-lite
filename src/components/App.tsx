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
import AppSettings from '../routes/AppSettings';
import Import from '../routes/Import';
import { SettingsProvider, useSettings } from '../contexts/SettingsProvider';
import { DisplayDensity } from '../models';
import { themes } from '../themes';
import { Core } from '../services/core';

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

    Core.health().then((res) => console.log(res));

    // checkForUpdates();
    // Core.checkForUpdates();
  }, []);

  useEffect(() => {
    // Theme
    const theme = themes.find((a) => a.id === settings.theme) || themes[0];
    for (const id in theme.values) {
      document.body.style.setProperty(
        `--${theme.values[id].variable}`,
        theme.values[id].value
      );
    }
    document.body.style.setProperty(
      '--app-accent-color',
      `#${settings.accentColor}`
    );
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme.values.headerBgColor.value);

    if (theme.settings.accentText) {
      document.body.style.setProperty(
        '--accent-text-color',
        `#${settings.accentColor}`
      );
    }
    if (theme.settings.accentHighlight) {
      document.body.style.setProperty(
        '--highlight-bg-color',
        `#${settings.accentColor}`
      );
    }
    if (theme.settings.accentHeader) {
      document.body.style.setProperty(
        '--header-bg-color',
        `#${settings.accentColor}`
      );
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', `#${settings.accentColor}`);
    }

    // Layout
    if (settings.displayDensity === DisplayDensity.Compact) {
      document.body.setAttribute('data-compact-layout', '');
    } else {
      document.body.removeAttribute('data-compact-layout');
    }
  }, [settings]);

  return (
    <Router>
      <Route path="/search" component={Search} />
      <Route path="/podcast/preview" component={PodcastPreview} />
      <Route path="/podcast/:podcastId" component={PodcastDetail} />
      <Route path="/episode/:episodeId" component={EpisodeDetail} />
      <Route path="/filter/:filterId" component={Filter} />
      <Route path="/player" component={Player} />
      <Route path="/settings" component={AppSettings} />
      <Route path="/import" component={Import} />
      <Route path="/podcasts" component={Podcasts} default={true} />
    </Router>
  );
}
