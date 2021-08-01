import { h } from 'preact';
import { route } from 'preact-router';
import { useContext, useEffect, useState } from 'preact/hooks';
import AppContext from '../contexts/appContext';
import { useNavKeys } from '../hooks/useNavKeys';
import { useShortcutKeys } from '../hooks/useShortcutKeys';
import { EpisodeExtended, EpisodeFilterId } from '../core/models';
import { EpisodeService } from '../core/services';
import style from './Filter.module.css';

const episodeService = new EpisodeService();

interface FilterProps {
  filterId: EpisodeFilterId;
}

export default function Filter({ filterId }: FilterProps): any {
  const [episodes, setEpisodes] = useState<EpisodeExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { openNav } = useContext(AppContext);

  const filterName: any = {
    recent: 'Most Recent',
    inProgress: 'In Progress',
  };

  useNavKeys({
    SoftLeft: () => openNav(),
  });

  const handleEpisodeClick = (episode: EpisodeExtended) => {
    route(`/episode/${episode.id}`);
  };

  useShortcutKeys(episodes || [], {}, (episode) => {
    handleEpisodeClick(episode);
  });

  useEffect(() => {
    episodeService.getByFilter(filterId).then((result) => {
      setLoading(false);
      setEpisodes(result);
    });
  }, [filterId]);

  return (
    <div className="view-container">
      <div className="kui-header">
        <h1 className="kui-h1">{filterName[filterId]}</h1>
      </div>
      <div className="view-content">
        {loading && (
          <div className={`kui-sec ${style.message}`}>Loading...</div>
        )}
        {!loading && episodes.length === 0 && (
          <div className={`kui-sec ${style.message}`}>No episodes.</div>
        )}
        <ul className="kui-list">
          {episodes.map((episode, i) => (
            <li
              key={episode.id}
              tabIndex={1}
              onClick={() => handleEpisodeClick(episode)}
            >
              <div class="kui-list-cont">
                <p className="kui-pri no-wrap">{episode.title}</p>
                <p className="kui-sec no-wrap">{episode.podcastTitle}</p>
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
