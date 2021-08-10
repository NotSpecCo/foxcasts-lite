import { useEffect } from 'preact/hooks';
import {
  cursorSelect,
  cursorSelectByKey,
  moveCursor,
  NavItem,
} from '../utils/navigation';

interface Options {
  capture?: boolean;
  stopPropagation?: boolean;
  scrollIntoView?: boolean;
  disabled?: boolean;
}

type Props<T> = {
  items: NavItem<T>[];
  onChange: (items: NavItem<T>[]) => void;
  onEnter: (item: NavItem<T>) => void;
  options: Options;
};

export function useDpad<T>({ options = {}, ...props }: Props<T>): void {
  // Apply defaults
  options = {
    capture: false,
    stopPropagation: false,
    scrollIntoView: true,
    disabled: false,
    ...options,
  };

  const shortcutKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const dpadKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];

  function handleKeyPress(ev: KeyboardEvent): void {
    if (
      options.disabled ||
      ![...dpadKeys, ...shortcutKeys].includes(ev.key) ||
      ev.shiftKey ||
      (ev.target as HTMLElement).tagName === 'INPUT'
    ) {
      return;
    }

    if (options.stopPropagation) {
      ev.stopPropagation();
      ev.preventDefault();
    }

    if (ev.key === 'Enter') {
      const selected = cursorSelect(props.items);
      if (selected) {
        props.onEnter(selected);
      }
      return;
    }

    if (shortcutKeys.includes(ev.key)) {
      const selected = cursorSelectByKey(props.items, ev.key);
      if (selected) {
        props.onEnter(selected);
      }
      return;
    }

    const direction = ['ArrowUp', 'ArrowLeft'].includes(ev.key)
      ? 'prev'
      : 'next';
    const newItems = moveCursor(props.items, direction, options.scrollIntoView);

    props.onChange(newItems);
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, options.capture);

    return (): void => {
      document.removeEventListener('keydown', handleKeyPress, options.capture);
    };
  });
}
