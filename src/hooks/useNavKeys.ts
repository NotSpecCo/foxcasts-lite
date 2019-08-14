import { useEffect } from 'preact/hooks';

type NavKey =
    | 'Escape'
    | 'SoftLeft'
    | 'SoftRight'
    | 'Backspace'
    | 'ArrowUp'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Enter';

interface Options {
    capture?: boolean;
    stopPropagation?: boolean;
}

export const useNavKeys = (actions: { [key in NavKey]?: () => void }, options: Options = {}) => {
    const keys = [
        'Escape',
        'SoftLeft',
        'SoftRight',
        'Backspace',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Enter'
    ];

    const parseKey = (ev: KeyboardEvent) => {
        // Simulate soft keys for testing purposes
        if (ev.shiftKey && ev.key === 'ArrowLeft') {
            return 'SoftLeft';
        }
        if (ev.shiftKey && ev.key === 'ArrowRight') {
            return 'SoftRight';
        }
        return ev.key;
    };

    const handleKeyPress = (ev: KeyboardEvent) => {
        const key = parseKey(ev);
        if (!keys.includes(key)) {
            return;
        }

        if (options.stopPropagation) {
            ev.stopPropagation();
            ev.preventDefault();
        }

        const action = actions[key as NavKey];

        if (!action) {
            return;
        }

        action();
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress, options.capture);

        return () => {
            document.removeEventListener('keydown', handleKeyPress, options.capture);
        };
    });
};
