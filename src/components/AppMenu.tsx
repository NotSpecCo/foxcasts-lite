import { h } from 'preact';
import { route } from 'preact-router';
import { useSettings } from '../contexts/SettingsProvider';
import { SelectablePriority } from '../enums';
import { useListNav } from '../hooks/useListNav';
import { ListLayout } from '../models';
import { AppBar } from '../ui-components/appbar';
import { SelectableBase } from '../ui-components/hoc';
import { SvgIcon } from '../ui-components/SvgIcon';
import { Tile } from '../ui-components/Tile';
import { Typography } from '../ui-components/Typography';
import styles from './AppMenu.module.css';

interface AppMenuProps {
  onClose: () => void;
}

export function AppMenu(props: AppMenuProps): h.JSX.Element | null {
  const { settings } = useSettings();
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
        pageRoute = '/player';
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
      <Typography type="bodyLarge">Foxcasts Lite</Typography>
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
      <AppBar leftIcon="cancel" rightIcon={null} />
    </div>
  );
}
