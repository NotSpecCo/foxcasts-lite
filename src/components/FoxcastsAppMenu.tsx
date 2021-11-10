import { PlaybackStatus } from 'foxcasts-core/lib/enums';
import { formatTime } from 'foxcasts-core/lib/utils';
import { SelectableBase } from 'mai-ui/dist/components/SelectableBase';
import { IconSize, SvgIcon } from 'mai-ui/dist/components/SvgIcon';
import { TileContent } from 'mai-ui/dist/components/tiles';
import { Tile } from 'mai-ui/dist/components/tiles/Tile';
import { Typography } from 'mai-ui/dist/components/Typography';
import { useView } from 'mai-ui/dist/contexts';
import { useListNav } from 'mai-ui/dist/hooks';
import { Fragment, h } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'react';
import { PlaybackProgress, usePlayer } from '../contexts/playerContext';
import { useSettings } from '../contexts/SettingsProvider';
import { ArtworkBlur, ArtworkSize, SelectablePriority } from '../enums';
import { useArtwork } from '../hooks/useArtwork';
import { ListLayout } from '../models';
import { Core } from '../services/core';
import { KaiOS } from '../services/kaios';
import { ifClass, joinClasses } from '../utils/classes';
import { ControllerOption } from './ControllerOption';
import styles from './FoxcastsAppMenu.module.css';

interface FoxcastsAppMenuProps {
  onClose?: () => void;
}

export function FoxcastsAppMenu(props: FoxcastsAppMenuProps): h.JSX.Element {
  const [status, setStatus] = useState<PlaybackProgress>({
    playing: false,
    currentTime: 0,
    duration: 0,
  });
  const { settings } = useSettings();
  const view = useView();
  const player = usePlayer();
  const { artwork } = useArtwork(player.episode?.podcastId, {
    size: ArtworkSize.Large,
    blur: ArtworkBlur.None,
  });

  useEffect(() => {
    view.setHomeMenuOpen(true);
    return () => view.setHomeMenuOpen(false);
  }, []);

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
      case 'home':
        pageRoute = '/home';
        break;
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
    // props.onClose();
  }

  const { selectedId } = useListNav({
    priority: SelectablePriority.Medium,
    onSelect: handleSelect,
  });

  return (
    <div className={styles.root}>
      <Typography type="bodyLarge">Foxcasts Lite</Typography>
      {settings.homeMenuLayout === ListLayout.Grid ? (
        <div className={styles.grid}>
          <Tile
            frontContent={
              <TileContent contentH="center" contentV="center">
                <SvgIcon icon="home" size={IconSize.Large} />
              </TileContent>
            }
            backContent={
              <TileContent>
                <Typography>home</Typography>
              </TileContent>
            }
            selectable={{
              priority: SelectablePriority.Medium,
              id: 'home',
              shortcut: '1',
              selected: selectedId === 'home',
            }}
          />
          <Tile
            frontContent={
              <TileContent contentH="center" contentV="center">
                <SvgIcon icon="grid" size={IconSize.Large} />
              </TileContent>
            }
            backContent={
              <TileContent>
                <Typography>podcasts</Typography>
              </TileContent>
            }
            selectable={{
              priority: SelectablePriority.Medium,
              id: 'podcasts',
              shortcut: '2',
              selected: selectedId === 'podcasts',
            }}
          />
          <Tile
            frontContent={
              <TileContent contentH="center" contentV="center">
                <SvgIcon icon="search" size={IconSize.Large} />
              </TileContent>
            }
            backContent={
              <TileContent>
                <Typography>search</Typography>
              </TileContent>
            }
            selectable={{
              priority: SelectablePriority.Medium,
              id: 'search',
              shortcut: '3',
              selected: selectedId === 'search',
            }}
          />
          <Tile
            frontContent={
              <TileContent contentH="center" contentV="center">
                <SvgIcon icon="list" size={IconSize.Large} />
              </TileContent>
            }
            backContent={
              <TileContent>
                <Typography>playlists</Typography>
              </TileContent>
            }
            selectable={{
              priority: SelectablePriority.Medium,
              id: 'playlists',
              shortcut: '4',
              selected: selectedId === 'playlists',
            }}
          />
          <Tile
            frontContent={
              <TileContent contentH="center" contentV="center">
                <SvgIcon icon="filter" size={IconSize.Large} />
              </TileContent>
            }
            backContent={
              <TileContent>
                <Typography>filters</Typography>
              </TileContent>
            }
            selectable={{
              priority: SelectablePriority.Medium,
              id: 'filters',
              shortcut: '5',
              selected: selectedId === 'filters',
            }}
          />
          <Tile
            frontContent={
              <TileContent contentH="center" contentV="center">
                <SvgIcon icon="download" size={IconSize.Large} />
              </TileContent>
            }
            backContent={
              <TileContent>
                <Typography>download</Typography>
              </TileContent>
            }
            selectable={{
              priority: SelectablePriority.Medium,
              id: 'downloads',
              shortcut: '6',
              selected: selectedId === 'downloads',
            }}
          />

          <Tile
            width={2}
            frontContent={
              player.episode ? (
                <TileContent backgroundImage={artwork?.image} contentH="left">
                  <div>
                    <Typography
                      padding="horizontal"
                      display="inline"
                      type="title"
                    >
                      {formatTime(status.currentTime || 0)}
                    </Typography>
                  </div>
                  <Typography
                    padding="horizontal"
                    wrap="nowrap"
                    type="bodyStrong"
                    display="inline"
                  >
                    {player.episode?.title}
                  </Typography>
                </TileContent>
              ) : (
                <TileContent>
                  <Typography>Now Playing</Typography>
                </TileContent>
              )
            }
            backContent={
              <TileContent contentV="top" contentH="left">
                <Typography>{player.episode?.title}</Typography>
              </TileContent>
            }
            selectable={{
              priority: SelectablePriority.Medium,
              id: 'player',
              shortcut: '7',
              selected: selectedId === 'player',
            }}
          />
          <Tile
            frontContent={
              <TileContent contentH="center" contentV="center">
                <SvgIcon icon="settings" size={IconSize.Large} />
              </TileContent>
            }
            backContent={
              <TileContent>
                <Typography>settings</Typography>
              </TileContent>
            }
            selectable={{
              priority: SelectablePriority.Medium,
              id: 'settings',
              shortcut: '9',
              selected: selectedId === 'settings',
            }}
          />
        </div>
      ) : (
        <div className={styles.list}>
          <SelectableBase
            className={styles.row}
            priority={SelectablePriority.Medium}
            id="home"
            shortcut="1"
            selected={selectedId === 'home'}
          >
            <SvgIcon icon="home" />
            <span>1</span>
            Home
          </SelectableBase>
          <SelectableBase
            className={styles.row}
            priority={SelectablePriority.Medium}
            id="podcasts"
            shortcut="2"
            selected={selectedId === 'podcasts'}
          >
            <SvgIcon icon="grid" />
            <span>2</span>
            Podcasts
          </SelectableBase>
          <SelectableBase
            className={styles.row}
            priority={SelectablePriority.Medium}
            id="search"
            shortcut="3"
            selected={selectedId === 'search'}
          >
            <SvgIcon icon="search" />
            <span>3</span>
            Search
          </SelectableBase>
          <SelectableBase
            className={styles.row}
            priority={SelectablePriority.Medium}
            id="playlists"
            shortcut="4"
            selected={selectedId === 'playlists'}
          >
            <SvgIcon icon="list" />
            <span>4</span>
            Playlists
          </SelectableBase>
          <SelectableBase
            className={styles.row}
            priority={SelectablePriority.Medium}
            id="filters"
            shortcut="5"
            selected={selectedId === 'filters'}
          >
            <SvgIcon icon="filter" />
            <span>5</span>
            Filters
          </SelectableBase>
          <SelectableBase
            className={styles.row}
            priority={SelectablePriority.Medium}
            id="downloads"
            shortcut="6"
            selected={selectedId === 'downloads'}
          >
            <SvgIcon icon="download" />
            <span>6</span>
            Download
          </SelectableBase>
          <SelectableBase
            className={styles.row}
            priority={SelectablePriority.Medium}
            id="settings"
            shortcut="7"
            selected={selectedId === 'settings'}
          >
            <SvgIcon icon="settings" />
            <span>7</span>
            Settings
          </SelectableBase>
        </div>
      )}
      {player.episode ? (
        <Fragment>
          {settings.homeMenuLayout === ListLayout.List && (
            <Fragment>
              <Typography type="caption">Now Playing</Typography>
              <SelectableBase
                className={joinClasses(
                  styles.player,
                  ifClass(selectedId === 'player', styles.selected)
                )}
                id="player"
                priority={SelectablePriority.Medium}
                shortcut="8"
              >
                <Typography padding="horizontal" wrap="nowrap">
                  {player.episode?.title}
                </Typography>
                <Typography
                  padding="horizontal"
                  color="secondary"
                  wrap="nowrap"
                >
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
            </Fragment>
          )}

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
  );
}
