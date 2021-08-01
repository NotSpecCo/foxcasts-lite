import { Fragment, h } from 'preact';
import { useContext, useState } from 'preact/hooks';
import OptionMenu from '../components/OptionMenu';
import ProgressBar from '../components/ProgressBar';
import AppContext from '../contexts/appContext';
import { useNavKeys } from '../hooks/useNavKeys';
import { usePlayerState, usePlayerActions } from '../hooks/usePlayer';
import formatTime from '../utils/formatTime';
import style from './Player.module.css';

export default function Player() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { episode, playing, progress, duration } = usePlayerState();
  const { setProgress, setPlaying, setEpisode } = usePlayerActions();
  const { openNav } = useContext(AppContext);

  useNavKeys({
    SoftLeft: () => openNav(),
    SoftRight: () => toggleMenu(true),
  });

  function getMenuOptions() {
    const options = [
      { id: 'stop', label: 'Stop' },
      { id: 'goToStart', label: 'Go to start' },
      { id: 'goToEnd', label: 'Go to end' },
    ];

    options.unshift(
      playing ? { id: 'pause', label: 'Pause' } : { id: 'play', label: 'Play' }
    );

    return options;
  }

  const handleOptionSelect = (id: string) => {
    switch (id) {
      case 'play':
        setPlaying(true);
        break;
      case 'pause':
        setPlaying(false);
        break;
      case 'stop':
        setEpisode(null);
        break;
      case 'goToStart':
        setProgress(0);
        break;
      case 'goToEnd':
        setProgress(duration);
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

  const jump = (seconds: number) => {
    if (!episode) {
      return;
    }

    let newTime = progress + seconds;
    if (newTime < 0) {
      newTime = 0;
    }
    if (newTime > duration) {
      newTime = duration;
    }

    setProgress(newTime);
  };

  return (
    <div className="view-container">
      <div className={`view-content padded ${style.content}`}>
        {episode && (
          <Fragment>
            <img className={style.cover} src={episode && episode.cover[100]} />
            <div className="kui-pri">{episode && episode.title}</div>
            <div className="kui-sec">{episode && episode.podcastTitle}</div>
            <ProgressBar position={(progress / duration) * 100} />
            <div className={style.times}>
              <span className="kui-thi">{formatTime(progress || 0)}</span>
              <span className="kui-thi">{formatTime(duration || 0)}</span>
            </div>
            <div className={style.buttons}>
              <img src="assets/icons/rw-30.png" onClick={() => jump(-30)} />
              <img src="assets/icons/rw-10.png" onClick={() => jump(-10)} />
              <img src="assets/icons/ff-10.png" onClick={() => jump(10)} />
              <img src="assets/icons/ff-30.png" onClick={() => jump(30)} />
            </div>
          </Fragment>
        )}
        {!episode && (
          <div className={`kui-sec ${style.message}`}>Nothing playing.</div>
        )}
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
