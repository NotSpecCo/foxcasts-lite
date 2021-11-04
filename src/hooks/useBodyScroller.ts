import { useEffect } from 'preact/hooks';
import { SelectablePriority } from '../enums';

type Props = {
  capture?: boolean;
};

export function useBodyScroller(props: Props): void {
  function getHighestPriorityElements() {
    const highElements = document.querySelectorAll(
      `[data-selectable-priority='${SelectablePriority.High}']`
    );
    if (highElements.length > 0)
      return {
        priority: SelectablePriority.High,
        results: Array.from(highElements).map((element) => ({
          element,
          id: element.getAttribute('data-selectable-id') || undefined,
          shortcut:
            element.getAttribute('data-selectable-shortcut') || undefined,
        })),
      };

    const mediumElements = document.querySelectorAll(
      `[data-selectable-priority='${SelectablePriority.Medium}']`
    );
    if (mediumElements.length > 0)
      return {
        priority: SelectablePriority.Medium,
        results: Array.from(mediumElements).map((element) => ({
          element,
          id: element.getAttribute('data-selectable-id') || undefined,
          shortcut:
            element.getAttribute('data-selectable-shortcut') || undefined,
        })),
      };

    const lowElements = document.querySelectorAll(
      `[data-selectable-priority='${SelectablePriority.Low}']`
    );
    if (lowElements.length > 0)
      return {
        priority: SelectablePriority.Low,
        results: Array.from(lowElements).map((element) => ({
          element,
          id: element.getAttribute('data-selectable-id') || undefined,
          shortcut:
            element.getAttribute('data-selectable-shortcut') || undefined,
        })),
      };
  }

  function handleKeyPress(ev: KeyboardEvent): void {
    if (!['ArrowUp', 'ArrowDown'].includes(ev.key)) return;

    const data = getHighestPriorityElements();
    if (data && data.results.length > 0) {
      return;
    }

    const scroller: HTMLElement | null = document.querySelector(
      `[data-selectable-scroller='${SelectablePriority.Low}']`
    );

    if (ev.key === 'ArrowUp') {
      scroller?.scrollBy({
        top: -30,
        behavior: 'smooth',
      });
    } else {
      scroller?.scrollBy({
        top: 30,
        behavior: 'smooth',
      });
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, props.capture);

    return (): void => {
      document.removeEventListener('keydown', handleKeyPress, props.capture);
    };
  });
}
