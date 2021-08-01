import { h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import OptionMenu from '../components/OptionMenu';
import AppContext from '../contexts/appContext';
import { useNavKeys } from '../hooks/useNavKeys';
import { usePlayerActions } from '../hooks/usePlayer';
import { EpisodeExtended } from '../models';
import { EpisodeService } from '../services/episodeService';
import formatFileSize from '../utils/formatFileSize';
import formatTime from '../utils/formatTime';

import style from './EpisodeDetail.module.css';

const episodeService = new EpisodeService();

interface EpisodeDetailProps {
  episodeId: string;
}

export default function EpisodeDetail({ episodeId }: EpisodeDetailProps): any {
  const [episode, setEpisode] = useState<EpisodeExtended | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { openNav } = useContext(AppContext);
  const player = usePlayerActions();

  useEffect(() => {
    episodeService.getById(parseInt(episodeId, 10)).then((result) => {
      setEpisode(result);
    });
  }, [episodeId]);

  useNavKeys({
    SoftLeft: () => openNav(),
    SoftRight: () => toggleMenu(true),
  });

  const getMenuOptions = () => {
    const options = [
      { id: 'stream', label: 'Stream' },
      // { id: 'markPlayed', label: 'Mark as Played' },
      // { id: 'markUnplayed', label: 'Mark as Unplayed' }
    ];

    if (episode && episode.progress > 0) {
      options.push({
        id: 'resume',
        label: `Resume at ${formatTime(episode.progress)}`,
      });
    }

    return options;
  };

  const handleOptionSelect = (id: string) => {
    switch (id) {
      case 'stream':
        player.setEpisode(episode!, false);
        break;
      case 'resume':
        player.setEpisode(episode!, true, true);
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
      <div class="view-content padded">
        <h2 className="kui-h2">{episode.title}</h2>
        <div className={`${style.details} kui-sec`}>
          <div className="row">
            <img src="/assets/icons/calendar.png" />
            {episode.date.toLocaleDateString()}
          </div>
          <div className="row">
            <img src="/assets/icons/timer.png" />
            {episode.duration ? formatTime(episode.duration) : 'Unknown'}
          </div>
          <div className="row">
            <img src="/assets/icons/sd-card.png" />
            {episode.fileSize ? formatFileSize(episode.fileSize) : 'Unknown'}
          </div>
        </div>
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
          options={getMenuOptions()}
          onSelect={handleOptionSelect}
          onCancel={handleOptionCancel}
        />
      )}
    </div>
  );
}
