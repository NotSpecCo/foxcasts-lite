import { FunctionalComponent, h } from 'preact';
import { route, Route, Router } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import AppContext from '../contexts/appContext';
import { PlayerProvider } from '../contexts/playerContext';
import { PodcastService } from '../core/services';
import EpisodeDetail from '../routes/EpisodeDetail';
import Filter from '../routes/Filter';
import Player from '../routes/Player';
import PodcastDetail from '../routes/PodcastDetail';
import PodcastPreview from '../routes/PodcastPreview';
import Search from '../routes/Search';
import Subscriptions from '../routes/Subscriptions';
import NavMenu, { NavMenuOption } from './NavMenu';

const NotFound = () => <div>Not Found!</div>;

const podcastService = new PodcastService();

const App: FunctionalComponent = () => {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (window.location.href.includes('index.html')) {
      route('/');
    }

    podcastService.checkForUpdates();
  }, []);

  const openNav = (): void => {
    setNavOpen(true);
  };

  const closeNav = (): void => {
    setNavOpen(false);
  };

  const handleNav = (option: NavMenuOption): void => {
    route(option.route);
    setNavOpen(false);
  };

  return (
    <div id="preact_root">
      <AppContext.Provider value={{ openNav }}>
        <PlayerProvider>
          <Router>
            <Route path="/" component={Subscriptions} />
            <Route path="/search" component={Search} />
            <Route path="/podcast/:podcastId" component={PodcastDetail} />
            <Route
              path="/podcast/:podcastId/preview"
              component={PodcastPreview}
            />
            <Route path="/episode/:episodeId" component={EpisodeDetail} />
            <Route path="/filter/:filterId" component={Filter} />
            <Route path="/player" component={Player} />
            <Route component={NotFound} default={true} />
          </Router>
          {navOpen && <NavMenu onSelect={handleNav} onClose={closeNav} />}
        </PlayerProvider>
      </AppContext.Provider>
    </div>
  );
};

export default App;
