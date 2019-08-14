import { PodcastService } from 'foxcasts-core/services';
import { h } from 'preact';
import { Route, route, Router } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import AppContext from '../contexts/appContext';
import { PlayerProvider } from '../contexts/playerContext';
import EpisodeDetail from '../routes/episode';
import Filter from '../routes/filter';
import Player from '../routes/player';
import PodcastDetail from '../routes/podcast';
import PodcastPreview from '../routes/podcast-preview';
import Search from '../routes/search';
import Subscriptions from '../routes/subscriptions';
import NavMenu, { NavMenuOption } from './nav-menu';

if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug');
}

const NotFound = () => <div>Not Found!</div>;

const podcastService = new PodcastService();

export default function App() {
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        if (window.location.href.includes('index.html')) {
            route('/');
        }

        podcastService.checkForUpdates();
    }, []);

    const openNav = () => {
        setNavOpen(true);
    };

    const closeNav = () => {
        setNavOpen(false);
    };

    const handleNav = (option: NavMenuOption) => {
        route(option.route);
        setNavOpen(false);
    };

    return (
        <div id="app">
            <AppContext.Provider value={{ openNav }}>
                <PlayerProvider>
                    <Router>
                        <Route path="/" component={Subscriptions as any} />
                        <Route path="/search" component={Search as any} />
                        <Route path="/podcast/:podcastId" component={PodcastDetail as any} />
                        <Route
                            path="/podcast/:podcastId/preview"
                            component={PodcastPreview as any}
                        />
                        <Route path="/episode/:episodeId" component={EpisodeDetail as any} />
                        <Route path="/filter/:filterId" component={Filter as any} />
                        <Route path="/player" component={Player as any} />
                        <Route default={true} component={NotFound as any} />
                    </Router>
                    {navOpen && <NavMenu onSelect={handleNav} onClose={closeNav} />}
                </PlayerProvider>
            </AppContext.Provider>
        </div>
    );
}
