import { h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import OptionMenu from '../../components/option-menu';
import AppContext from '../../contexts/appContext';
import { useNavKeys } from '../../hooks/useNavKeys';
import { usePlayerActions } from '../../hooks/usePlayer';
import { Episode } from '../../models';
import PodcastService from '../../services/podcastService';

const podcastService = new PodcastService();

interface EpisodeDetailProps {
    episodeId: string;
}

export default function EpisodeDetail({ episodeId }: EpisodeDetailProps) {
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const { openNav } = useContext(AppContext);
    const player = usePlayerActions();

    useEffect(() => {
        podcastService.getEpisodeById(parseInt(episodeId, 10)).then(result => {
            setEpisode(result);
        });
    }, [episodeId]);

    useNavKeys({
        SoftLeft: () => openNav(),
        SoftRight: () => toggleMenu(true),
        Enter: () => console.log('episode enter pressed')
    });

    const options = [
        { id: 'stream', label: 'Stream' },
        { id: 'markPlayed', label: 'Mark as Played' },
        { id: 'markUnplayed', label: 'Mark as Unplayed' }
    ];

    const handleOptionSelect = (id: string) => {
        switch (id) {
            case 'stream':
                player.setEpisode(episode!, false);
                break;
        }

        toggleMenu(false);
    };
    const handleOptionCancel = () => {
        toggleMenu(false);
    };

    const toggleMenu = (state?: boolean) => {
        setMenuOpen(state !== undefined ? state : !menuOpen);
    };

    if (!episode) {
        return null;
    }

    return (
        <div class="view-container">
            <div class="kui-header">
                <h1 class="kui-h1">Episode Detail</h1>
            </div>
            <div class="view-content">
                <h2 className="kui-h2">{episode.title}</h2>

                <p className="kui-text">{episode.subTitle}</p>
            </div>
            <div class="kui-software-key bottom">
                <h5 class="kui-h5">Nav</h5>
                <h5 class="kui-h5" />
                <h5 class="kui-h5">Actions</h5>
            </div>
            {menuOpen && (
                <OptionMenu
                    title="Episode Actions"
                    options={options}
                    onSelect={handleOptionSelect}
                    onCancel={handleOptionCancel}
                />
            )}
        </div>
    );
}
