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
  disabled?: boolean;
  allowInInputs?: boolean;
}

export function useNavKeys(
  actions: { [key in NavKey]?: (ev: KeyboardEvent) => void },
  options: Options = {}
): void {
  const keys = [
    'Escape',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Enter',
    'SoftLeft',
    'SoftRight',
    'Backspace',
  ];

  function parseKey(ev: KeyboardEvent): string {
    // Simulate soft keys for testing purposes
    if (ev.shiftKey && ev.key === 'ArrowLeft') {
      return 'SoftLeft';
    }
    if (ev.shiftKey && ev.key === 'ArrowRight') {
      return 'SoftRight';
    }
    return ev.key;
  }

  function handleKeyPress(ev: KeyboardEvent): void {
    const key = parseKey(ev);
    if (
      options.disabled ||
      !keys.includes(key) ||
      ((ev.target as HTMLElement).tagName === 'INPUT' && !options.allowInInputs)
    ) {
      return;
    }

    const action = actions[key as NavKey];
    if (!action) {
      return;
    }

    if (options.stopPropagation) {
      ev.stopPropagation();
      ev.preventDefault();
    }

    action(ev);
  }

  useEffect(() => {
    if (options.disabled) return;

    document.addEventListener('keydown', handleKeyPress, options.capture);

    return (): void => {
      document.removeEventListener('keydown', handleKeyPress, options.capture);
    };
  });
}
