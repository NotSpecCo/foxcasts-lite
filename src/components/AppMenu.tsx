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
import { ViewTab, ViewTabBar } from '../ui-components/view';
import styles from './AppMenu.module.css';
import { ControllerOption } from './ControllerOption';

interface AppMenuProps {
  onClose: () => void;
}

export function AppMenu(props: AppMenuProps): h.JSX.Element | null {
  const [tabId, setTabId] = useState<'menu' | 'remote'>('menu');
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
      Core.updateEpisode(player.episode.id, {
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
      case 'lists':
        pageRoute = '/lists';
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
      <Typography type="bodyLarge" padding="horizontal">
        Foxcasts Lite
      </Typography>
      <ViewTabBar
        tabs={[
          { id: 'menu', label: 'menu' },
          { id: 'remote', label: 'remote' },
        ]}
        selectedId={tabId}
        onChange={(tabId) => setTabId(tabId as any)}
      />
      <ViewTab tabId="menu" activeTabId={tabId}>
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
              icon="play"
              backText="Player"
              selectable={{
                priority: SelectablePriority.Medium,
                id: 'player',
                shortcut: '3',
                selected: selectedId === 'player',
              }}
            />
            <Tile
              icon="list"
              backText="Lists"
              selectable={{
                priority: SelectablePriority.Medium,
                id: 'lists',
                shortcut: '4',
                selected: selectedId === 'lists',
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
              <span>1</span>
              <SvgIcon icon="grid" />
              Podcasts
            </SelectableBase>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="search"
              shortcut="2"
              selected={selectedId === 'search'}
            >
              <span>2</span>
              <SvgIcon icon="search" />
              Search
            </SelectableBase>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="player"
              shortcut="3"
              selected={selectedId === 'player'}
            >
              <span>3</span>
              <SvgIcon icon="play" />
              Player
            </SelectableBase>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="lists"
              shortcut="4"
              selected={selectedId === 'lists'}
            >
              <span>4</span>
              <SvgIcon icon="list" />
              Lists
            </SelectableBase>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="downloads"
              shortcut="5"
              selected={selectedId === 'downloads'}
            >
              <span>5</span>
              <SvgIcon icon="download" />
              Download
            </SelectableBase>
            <SelectableBase
              className={styles.row}
              priority={SelectablePriority.Medium}
              id="settings"
              shortcut="6"
              selected={selectedId === 'settings'}
            >
              <span>6</span>
              <SvgIcon icon="settings" />
              Settings
            </SelectableBase>
          </div>
        )}
      </ViewTab>
      <ViewTab tabId="remote" activeTabId={tabId}>
        <Typography type="caption">Now Playing</Typography>
        {player.episode ? (
          <Fragment>
            <Typography padding="horizontal">
              {player.episode?.title}
            </Typography>
            <Typography padding="horizontal" color="accent">
              {player.episode?.podcastTitle}
            </Typography>
            <Typography padding="horizontal" display="inline" type="bodyLarge">
              {formatTime(status.currentTime || 0)}
            </Typography>
            {' / '}
            <Typography padding="horizontal" display="inline" color="secondary">
              {formatTime(status.duration || 0)}
            </Typography>
          </Fragment>
        ) : (
          <Typography>Nothing playing</Typography>
        )}
        <Typography type="caption">Controls</Typography>
        <ControllerOption
          label="Playback"
          disabled={!player.episode}
          leftAction={() => setStatus(player.jump(-settings.playbackSkipBack))}
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
      </ViewTab>

      <AppBar leftIcon="cancel" rightIcon={null} />
    </div>
  );
}
