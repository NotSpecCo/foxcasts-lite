import { h } from 'preact';
import { useNavKeys } from '../../hooks/useNavKeys';
import { useShortcutKeys } from '../../hooks/useShortcutKeys';
import { Option } from '../../models';
import * as style from './style.css';

interface OptionMenuProps {
    options: Option[];
    title?: string | null;
    onSelect: (id: string) => void;
    onCancel: () => void;
}

export default function OptionMenu(props: OptionMenuProps) {
    useNavKeys(
        {
            Enter: () => console.log('menu enter pressed'),
            Escape: () => props.onCancel(),
            SoftLeft: () => props.onCancel(),
            Backspace: () => props.onCancel()
        },
        { capture: true, stopPropagation: true }
    );

    useShortcutKeys<Option>(props.options, { capture: true, stopPropagation: true }, option =>
        props.onSelect(option.id)
    );

    const handleSelect = (id: string) => () => {
        props.onSelect(id);
    };

    return (
        <div className={style.root}>
            <div class="kui-option-menu">
                {props.title !== null && (
                    <h2 class="kui-pri kui-option-title">{props.title || 'Option Menu'}</h2>
                )}
                <ul class="kui-options">
                    {props.options.map(option => (
                        <li key={option.id} onClick={handleSelect(option.id)} tabIndex={1}>
                            {option.label}
                        </li>
                    ))}
                </ul>
                <div class="kui-software-key">
                    <h5 class="kui-h5">Cancel</h5>
                    <h5 class="kui-h5">SELECT</h5>
                    <h5 class="kui-h5" />
                </div>
            </div>
        </div>
    );
}
