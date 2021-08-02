import { h } from 'preact';
import { route } from 'preact-router';
import { Menu, MenuOption } from '../ui-components';

interface AppMenuProps {
  onClose: () => void;
}

export function AppMenu(props: AppMenuProps): h.JSX.Element | null {
  const options: MenuOption[] = [
    { id: 'podcasts', label: 'Podcasts' },
    { id: 'search', label: 'Search' },
    { id: 'player', label: 'Player' },
    { id: 'mostRecent', label: 'Most Recent' },
    { id: 'inProgress', label: 'In Progress' },
    { id: 'settings', label: 'Settings' },
  ];

  function handleSelect(id: string): void {
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
      case 'settings':
        pageRoute = '/settings';
        break;
    }

    route(pageRoute);
    props.onClose();
  }

  return (
    <Menu options={options} onSelect={handleSelect} onClose={props.onClose} />
  );
}
