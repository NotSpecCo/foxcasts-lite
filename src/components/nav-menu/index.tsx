import { h } from 'preact';
import { useNavKeys } from '../../hooks/useNavKeys';
import { useShortcutKeys } from '../../hooks/useShortcutKeys';

interface NavMenuProps {
    onSelect: (option: NavMenuOption) => void;
    onClose: () => void;
}

export interface NavMenuOption {
    id: string;
    label: string;
    route: string;
    shortcutKey: string;
}

export default function NavMenu(props: NavMenuProps) {
    const navOptions: NavMenuOption[] = [
        { id: 'subscriptions', label: 'Subscriptions', route: '/', shortcutKey: '1' },
        { id: 'search', label: 'Search', route: '/search', shortcutKey: '2' },
        { id: 'player', label: 'Player', route: '/player', shortcutKey: '3' }
        // { id: 'settings', label: 'Settings', route: '/settings', shortcutKey: '3' }
    ];
    const filterOptions: NavMenuOption[] = [
        { id: 'mostRecent', label: 'Most Recent', route: '/filter/recent', shortcutKey: '4' },
        { id: 'inProgress', label: 'In Progress', route: '/filter/inProgress', shortcutKey: '5' }
    ];

    useNavKeys(
        {
            Escape: () => props.onClose(),
            SoftLeft: () => props.onClose(),
            Backspace: () => props.onClose()
        },
        { capture: true, stopPropagation: true }
    );

    useShortcutKeys(
        navOptions.concat(filterOptions),
        { capture: true, stopPropagation: true },
        option => props.onSelect(option)
    );

    const handleSelect = (id: any) => () => {
        props.onSelect(id);
    };

    return (
        <div class="kui-option-menu full-screen" style={{ 'z-index': 100 }}>
            {/* <h2 class="kui-pri kui-option-title">Foxcasts</h2> */}
            <ul class="kui-options">
                {navOptions.map(option => (
                    <li key={option.id} onClick={handleSelect(option)} tabIndex={1}>
                        {option.label}
                    </li>
                ))}
                <div class="kui-separator">
                    <h4 class="kui-h4">Filters</h4>
                </div>
                {filterOptions.map(option => (
                    <li key={option.id} onClick={handleSelect(option)} tabIndex={1}>
                        {option.label}
                    </li>
                ))}
            </ul>
            <div class="kui-software-key">
                <h5 class="kui-h5">Close</h5>
                <h5 class="kui-h5">SELECT</h5>
                <h5 class="kui-h5" />
            </div>
        </div>
    );
}
