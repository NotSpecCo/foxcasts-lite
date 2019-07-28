import { Podcast } from 'foxcasts-core/models';
import { PodcastService } from 'foxcasts-core/services';
import { h } from 'preact';
import { route } from 'preact-router';
import { useContext, useEffect, useState } from 'preact/hooks';
import AppContext from '../../contexts/appContext';
import { useNavKeys } from '../../hooks/useNavKeys';
import { useShortcutKeys } from '../../hooks/useShortcutKeys';

const podcastService = new PodcastService();

export default function Subscriptions() {
    const [subs, setSubs] = useState<Podcast[]>([]);
    const [] = useState(false);

    const { openNav } = useContext(AppContext);

    useEffect(() => {
        podcastService.getSubscriptions().then(result => {
            setSubs(result);
        });
    }, []);

    useNavKeys({
        SoftLeft: () => openNav()
    });

    useShortcutKeys(subs, {}, sub => handlePodcastClick(sub)());

    const handlePodcastClick = (podcast: Podcast) => () => {
        route(`/podcast/${podcast.id}`);
    };

    return (
        <div class="view-container">
            <div class="kui-header">
                <h1 class="kui-h1">Subscriptions</h1>
            </div>
            <div class="view-content">
                <ul class="kui-list">
                    {subs.map(sub => (
                        <li
                            key={sub.id}
                            class="register-dpad"
                            tabIndex={1}
                            onClick={handlePodcastClick(sub)}
                        >
                            <img class="kui-list-img" src={sub.cover['60']} />
                            <div class="kui-list-cont">
                                <p class="kui-pri">{sub.title}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div class="kui-software-key bottom">
                <h5 class="kui-h5">Nav</h5>
                <h5 class="kui-h5">SELECT</h5>
                <h5 class="kui-h5" />
            </div>
        </div>
    );
}
