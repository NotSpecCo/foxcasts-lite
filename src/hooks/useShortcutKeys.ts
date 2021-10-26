import { useEffect } from 'preact/hooks';

interface Options {
  capture?: boolean;
  stopPropagation?: boolean;
}

export function useShortcutKeys<T>(
  items: T[],
  options: Options = {},
  callback: (selectedItem: T) => void
) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const handleKeyPress = (ev: KeyboardEvent) => {
    if (!keys.includes(ev.key)) {
      return;
    }

    if (options.stopPropagation) {
      ev.stopPropagation();
      ev.preventDefault();
    }

    const selectedItem = items[parseInt(ev.key, 10) - 1];
    if (!selectedItem) {
      return;
    }

    callback(selectedItem);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, options.capture);

    return () => {
      document.removeEventListener('keydown', handleKeyPress, options.capture);
    };
  });
}
