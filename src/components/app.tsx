import { PodcastService } from 'foxcasts-core/services';
import { Component, h } from 'preact';
import { Route, route, Router } from 'preact-router';
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

export default class App extends Component {
    public state = {
        navOpen: false
    };

    public componentDidMount() {
        if (window.location.href.includes('index.html')) {
            route('/');
        }

        podcastService.checkForUpdates();
    }

    public openNav = () => {
        this.setState({ navOpen: true });
    };

    public closeNav = () => {
        this.setState({ navOpen: false });
    };

    public handleNav = (option: NavMenuOption) => {
        route(option.route);
        this.setState({ navOpen: false });
    };

    public render() {
        return (
            <div id="app">
                <AppContext.Provider value={{ openNav: this.openNav }}>
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
                        {this.state.navOpen && (
                            <NavMenu onSelect={this.handleNav} onClose={this.closeNav} />
                        )}
                    </PlayerProvider>
                </AppContext.Provider>
            </div>
        );
    }
}
