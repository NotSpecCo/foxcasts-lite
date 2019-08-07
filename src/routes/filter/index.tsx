import { EpisodeExtended } from 'foxcasts-core/models';
import { EpisodeService } from 'foxcasts-core/services';
import { h } from 'preact';
import { route } from 'preact-router';
import { useContext, useEffect, useState } from 'preact/hooks';
import AppContext from '../../contexts/appContext';
import { useNavKeys } from '../../hooks/useNavKeys';
import { useShortcutKeys } from '../../hooks/useShortcutKeys';
import * as style from './style.css';

const episodeService = new EpisodeService();

interface FilterProps {
    filterId: any;
}

function Filter({ filterId }: FilterProps) {
    const [episodes, setEpisodes] = useState<EpisodeExtended[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { openNav } = useContext(AppContext);

    const filterName: any = {
        recent: 'Most Recent',
        inProgress: 'In Progress'
    };

    useNavKeys({
        SoftLeft: () => openNav()
    });

    useShortcutKeys(episodes || [], {}, episode => {
        handleEpisodeClick(episode);
    });

    useEffect(() => {
        episodeService.getByFilter(filterId).then(result => {
            setLoading(false);
            setEpisodes(result);
        });
    }, [filterId]);

    const handleEpisodeClick = (episode: EpisodeExtended) => {
        route(`/episode/${episode.id}`);
    };

    return (
        <div className="view-container">
            <div className="kui-header">
                <h1 className="kui-h1">{filterName[filterId]}</h1>
            </div>
            <div className="view-content">
                {loading && <div className={`kui-sec ${style.message}`}>Loading...</div>}
                {!loading && episodes.length === 0 && (
                    <div className={`kui-sec ${style.message}`}>No episodes.</div>
                )}
                <ul className="kui-list">
                    {episodes.map(episode => (
                        <li
                            key={episode.id}
                            tabIndex={1}
                            onClick={() => handleEpisodeClick(episode)}
                        >
                            <div class="kui-list-cont">
                                <p className={`kui-pri ${style.episodeTitle}`}>{episode.title}</p>
                                <p class="kui-sec">{episode.podcastTitle}</p>
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

export default Filter;
