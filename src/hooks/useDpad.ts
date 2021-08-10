import { useEffect } from 'preact/hooks';
import { moveCursor } from '../utils/navigation';

interface Options {
  capture?: boolean;
  stopPropagation?: boolean;
  scrollIntoView?: boolean;
  disabled?: boolean;
}

export enum SelectablePriority {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

type Props<T> = {
  priority?: SelectablePriority;
  onChange?: (itemId: string | undefined) => void;
  onEnter: (itemId: string) => void;
  options?: Options;
};

export function useDpad<T>({
  priority = SelectablePriority.Low,
  options = {},
  ...props
}: Props<T>): void {
  // Apply defaults
  options = {
    capture: false,
    stopPropagation: true,
    scrollIntoView: true,
    disabled: false,
    ...options,
  };

  const shortcutKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const dpadKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];

  function getElements(priority: SelectablePriority): Element[] {
    return Array.from(
      document.querySelectorAll(`[data-selectable-priority='${priority}']`)
    );
  }

  function getSelectedElement(
    priority: SelectablePriority
  ): Element | undefined {
    const elements = getElements(priority);
    return elements.find((a) => a.hasAttribute('data-selected'));
  }

  function handleKeyPress(ev: KeyboardEvent): void {
    let elements: Element[] = [];
    let workingPriority = SelectablePriority.Low;

    const highElements = getElements(SelectablePriority.High);
    const mediumElements = getElements(SelectablePriority.Medium);
    const lowElements = getElements(SelectablePriority.Low);

    if (highElements.length > 0) {
      elements = highElements;
      workingPriority = SelectablePriority.High;
    } else if (mediumElements.length > 0) {
      elements = mediumElements;
      workingPriority = SelectablePriority.Medium;
    } else if (lowElements.length > 0) {
      elements = lowElements;
      workingPriority = SelectablePriority.Low;
    }

    if (
      elements.length === 0 ||
      workingPriority !== priority ||
      options.disabled ||
      ![...dpadKeys, ...shortcutKeys].includes(ev.key) ||
      ev.shiftKey ||
      ((ev.target as HTMLElement).tagName === 'INPUT' &&
        ['ArrowLeft', 'ArrowRight', ...shortcutKeys].includes(ev.key))
    ) {
      return;
    }

    if (options.stopPropagation) {
      ev.stopPropagation();
      ev.preventDefault();
    }

    if (ev.key === 'Enter') {
      const selected = getSelectedElement(priority);
      if (selected) {
        const id = selected.getAttribute('data-selectable-id') as string;
        props.onEnter(id);
      }
      return;
    }

    if (shortcutKeys.includes(ev.key)) {
      const elements = getElements(priority);
      const selected = elements[parseInt(ev.key, 10) - 1];
      if (selected) {
        const id = selected.getAttribute('data-selectable-id') as string;
        props.onEnter(id);
      }
      return;
    }

    const direction = ['ArrowUp', 'ArrowLeft'].includes(ev.key)
      ? 'prev'
      : 'next';
    const selected = moveCursor(elements, direction);
    if (selected) {
      const id = selected.getAttribute('data-selectable-id') as string;
      props.onChange?.(id);
    } else {
      props.onChange?.(undefined);
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, options.capture);

    return (): void => {
      document.removeEventListener('keydown', handleKeyPress, options.capture);
    };
  });
}
