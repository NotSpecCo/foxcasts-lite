import { useEffect } from 'preact/hooks';
import { cursorSelect, moveCursor, NavItem } from '../utils/navigation';

interface Options {
  capture?: boolean;
  stopPropagation?: boolean;
}

type Props<T> = {
  items: NavItem<T>[];
  onChange: (items: NavItem<T>[]) => void;
  onEnter: (item: NavItem<T>) => void;
  options: Options;
};

export function useDpad<T>({ options = {}, ...props }: Props<T>): void {
  const keys = ['ArrowUp', 'ArrowDown', 'Enter'];
  // const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];

  function handleKeyPress(ev: KeyboardEvent): void {
    if (
      !keys.includes(ev.key) ||
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

    const direction = ev.key === 'ArrowUp' ? 'prev' : 'next';
    const newItems = moveCursor(props.items, direction);

    props.onChange(newItems);
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, options.capture);

    return () => {
      document.removeEventListener('keydown', handleKeyPress, options.capture);
    };
  });
}
