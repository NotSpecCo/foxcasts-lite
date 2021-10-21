import { h } from 'preact';
import { route } from 'preact-router';
import { Typography } from '../ui-components/Typography';
import styles from './AppMenu.module.css';
import { Tile } from '../ui-components2/Tile';
import { SelectablePriority, useDpad } from '../hooks/useDpad';
import { AppBar } from '../ui-components2/appbar';
import { useListNav } from '../hooks/useListNav';

interface AppMenuProps {
  onClose: () => void;
}

export function AppMenu(props: AppMenuProps): h.JSX.Element | null {
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
      case 'mostRecent':
        pageRoute = '/filter/recent';
        break;
      case 'inProgress':
        pageRoute = '/filter/inProgress';
        break;
      case 'downloads':
        pageRoute = '/downloads';
        break;
      case 'settings':
        pageRoute = '/settings';
        break;
    }

    route(pageRoute);
    props.onClose();
  }

  const { selectedId } = useListNav({
    priority: SelectablePriority.Medium,
    onSelect: handleSelect,
  });
  console.log('selid', selectedId);

  return (
    <div className={styles.root}>
      <Typography type="bodyLarge">Foxcasts Lite</Typography>
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
      <AppBar leftIcon="cancel" rightIcon={null} />
    </div>
  );
}
