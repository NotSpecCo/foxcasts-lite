import { PlaybackStatus } from 'foxcasts-core/lib/enums';
import { formatTime } from 'foxcasts-core/lib/utils';
import { Fragment, h } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'react';
import { PlaybackProgress, usePlayer } from '../contexts/playerContext';
import { useSettings } from '../contexts/SettingsProvider';
import { useView } from '../contexts/ViewProvider';
import { SelectablePriority } from '../enums';
import { useListNav } from '../hooks/useListNav';
import { ListLayout } from '../models';
import { Core } from '../services/core';
import { KaiOS } from '../services/kaios';
import { AppBar } from '../ui-components/appbar';
import { SelectableBase } from '../ui-components/hoc';
import { SvgIcon } from '../ui-components/SvgIcon';
import { Tile } from '../ui-components/Tile';
import { Typography } from '../ui-components/Typography';
import { ifClass, joinClasses } from '../utils/classes';
import styles from './AppMenu.module.css';
import { ControllerOption } from './ControllerOption';

interface AppMenuProps {
  onClose: () => void;
}

export function AppMenu(props: AppMenuProps): h.JSX.Element | null {
  const [status, setStatus] = useState<PlaybackProgress>({
    playing: false,
    currentTime: 0,
    duration: 0,
  });
  const { settings } = useSettings();
  const view = useView();

  useEffect(() => {
    view.setHomeMenuOpen(true);
    return () => view.setHomeMenuOpen(false);
  }, []);

  const player = usePlayer();

  useEffect(() => {
    if (!player.episode) return;

    const status = player.getStatus();
    setStatus(status);

    const timer = setInterval(() => {
      const status = player.getStatus();
      if (!player.episode) return;
      Core.episodes.update(player.episode.id, {
        progress: status.currentTime,
        duration: status.duration,
        playbackStatus:
          status.currentTime > 0 && status.currentTime === status.duration
            ? PlaybackStatus.Played
            : PlaybackStatus.InProgress,
      });
      setStatus(status);
    }, 1000);

    return (): void => clearInterval(timer);
  }, [player.episode]);

  function handleSelect(id?: string): void {
    console.log('select', id);

    let pageRoute = '/';

    switch (id) {
      case 'podcasts':
        pageRoute = '/podcasts';
        break;
      case 'search':
        pageRoute = '/search';
        break;
      case 'player':
        pageRoute = '/player/player';
        break;
      case 'playlists':
        pageRoute = '/playlists';
        break;
      case 'filters':
        pageRoute = '/filters';
        break;
      case 'downloads':
        pageRoute = '/downloads';
        break;
      case 'settings':
        pageRoute = '/settings/display';
        break;
    }

    route(pageRoute);
    props.onClose();
  }

  const { selectedId } = useListNav({
    priority: SelectablePriority.Medium,
    onSelect: handleSelect,
  });

  return (
    <div className={styles.root}>
      <Typography type="bodyLarge">Foxcasts Lite</Typography>
      <div
        className={styles.scroller}
        data-selectable-scroller={SelectablePriority.Medium}
      >
        {settings.homeMenuLayout === ListLayout.Grid ? (
          <div className={styles.grid}>
            <Tile
              icon="grid"
              backText="Podcasts"
              selectable={{
                priority: SelectablePriority.Medium,
                id: 'podcasts',
                shortcut: '1',
                selected: selectedId === 'podcasts',
              }}
            />
            <Tile
              icon="search"
              backText="Search"
              selectable={{
                priority: SelectablePriority.Medium,
                id: 'search',
                shortcut: '2',
                selected: selectedId === 'search',
              }}
            />
            <Tile
              icon="list"
              backText="Playlists"
              selectable={{
                priority: SelectablePriority.Medium,
                id: 'playlists',
                shortcut: '3',
                selected: selectedId === 'playlists',
              }}
            />
            <Tile
              icon="filter"
              backText="Filters"
              selectable={{
                priority: SelectablePriority.Medium,
                id: 'filters',
                shortcut: '4',
                selected: selectedId === 'filters',
              }}
            />
            <Tile
              icon="download"
              backText="Download"
              selectable={{
                priority: SelectablePriority.Medium,
                id: 'downloads',
                shortcut: '5',
                selected: selectedId === 'downloads',
              }}
            />
            <Tile
              icon="settings"
              backText="Settings"
              selectable={{
                priority: SelectablePriority.Medium,
                id: 'settings',
                shortcut: '6',
                selected: selectedId === 'settings',
              }}
            />
          </div>
        ) : (
          <div className={styles.list}>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="podcasts"
              shortcut="1"
              selected={selectedId === 'podcasts'}
            >
              <SvgIcon icon="grid" />
              <span>1</span>
              Podcasts
            </SelectableBase>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="search"
              shortcut="2"
              selected={selectedId === 'search'}
            >
              <SvgIcon icon="search" />
              <span>2</span>
              Search
            </SelectableBase>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="playlists"
              shortcut="3"
              selected={selectedId === 'playlists'}
            >
              <SvgIcon icon="list" />
              <span>3</span>
              Playlists
            </SelectableBase>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="filters"
              shortcut="4"
              selected={selectedId === 'filters'}
            >
              <SvgIcon icon="filter" />
              <span>4</span>
              Filters
            </SelectableBase>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="downloads"
              shortcut="5"
              selected={selectedId === 'downloads'}
            >
              <SvgIcon icon="download" />
              <span>5</span>
              Download
            </SelectableBase>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="settings"
              shortcut="6"
              selected={selectedId === 'settings'}
            >
              <SvgIcon icon="settings" />
              <span>6</span>
              Settings
            </SelectableBase>
          </div>
        )}
        {player.episode ? (
          <Fragment>
            {settings.homeMenuLayout === ListLayout.List && (
              <Typography type="caption">Now Playing</Typography>
            )}
            <SelectableBase
              className={joinClasses(
                styles.player,
                ifClass(selectedId === 'player', styles.selected)
              )}
              id="player"
              priority={SelectablePriority.Medium}
              shortcut="7"
            >
              <Typography padding="horizontal" wrap="nowrap">
                {player.episode?.title}
              </Typography>
              <Typography padding="horizontal" color="secondary" wrap="nowrap">
                {player.episode?.podcastTitle}
              </Typography>
              <Typography
                padding="horizontal"
                display="inline"
                type="bodyStrong"
              >
                {formatTime(status.currentTime || 0)}
              </Typography>
              /
              <Typography
                padding="horizontal"
                display="inline"
                color="secondary"
              >
                {formatTime(status.duration || 0)}
              </Typography>
            </SelectableBase>

            <Typography type="caption">Controls</Typography>
            <ControllerOption
              label="Playback"
              disabled={!player.episode}
              leftAction={() =>
                setStatus(player.jump(-settings.playbackSkipBack))
              }
              rightAction={() =>
                setStatus(player.jump(settings.playbackSkipForward))
              }
              centerAction={() =>
                status.playing
                  ? setStatus(player.pause())
                  : setStatus(player.play())
              }
              selectable={{
                priority: SelectablePriority.Medium,
                id: 'playback',
                selected: selectedId === 'playback',
              }}
            />
            <ControllerOption
              label="Volume"
              leftAction={() => KaiOS.system.volumeDown()}
              rightAction={() => KaiOS.system.volumeUp()}
              centerAction={() => KaiOS.system.volumeShow()}
              selectable={{
                priority: SelectablePriority.Medium,
                id: 'volume',
                selected: selectedId === 'volume',
              }}
            />
          </Fragment>
        ) : null}
      </div>
      <AppBar leftIcon="cancel" rightIcon={null} />
    </div>
  );
}
