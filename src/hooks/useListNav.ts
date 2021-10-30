import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { scrollIntoView } from '../utils/navigation';
import { updateRouteWithSelectedId } from '../utils/route';
import { SelectablePriority } from './useDpad';

type ElementWithId = Element & {
  selectableId: string;
};

type Props = {
  priority?: SelectablePriority;
  initialSelectedId?: string;
  capture?: boolean;
  updateRouteOnChange?: boolean;
  onChange?: (selectedId: string) => void;
  onSelect?: (selectedId: string) => void;
};

type Return = {
  selectedId?: string;
};

export function useListNav({
  priority = SelectablePriority.Low,
  capture = false,
  updateRouteOnChange = true,
  ...props
}: Props): Return {
  const [selectedId, setSelectedId] = useState<string>();

  // Restore scroll position
  useEffect(() => {
    if (!props.initialSelectedId) {
      setSelectedId(undefined);
      return;
    }
    const scroller: HTMLElement | null = document.querySelector(
      `[data-selectable-scroller='${priority}']`
    );
    const element: HTMLElement | null = document.querySelector(
      `[data-selectable-id='${props.initialSelectedId}']`
    );

    if (scroller && element) {
      setSelectedId(props.initialSelectedId);
      scrollIntoView(scroller, element, 'auto');
    }
  }, [props.initialSelectedId]);

  function getHighestPriorityElements() {
    const highElements = document.querySelectorAll(
      `[data-selectable-priority='${SelectablePriority.High}']`
    );
    if (highElements.length > 0)
      return {
        priority: SelectablePriority.High,
        results: Array.from(highElements).map((element) => ({
          element,
          id: element.getAttribute('data-selectable-id') || '',
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
          id: element.getAttribute('data-selectable-id') || '',
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
          id: element.getAttribute('data-selectable-id') || '',
          shortcut:
            element.getAttribute('data-selectable-shortcut') || undefined,
        })),
      };
  }

  function handleKeyPress(ev: KeyboardEvent): void {
    // console.log('handleKeyPress', ev);
    const target = ev.target as HTMLElement | null;

    // Check if valid key
    const shortcutKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const dpadKeys = ['ArrowUp', 'ArrowDown', 'Enter'];
    if (
      ![...dpadKeys, ...shortcutKeys].includes(ev.key) ||
      (shortcutKeys.includes(ev.key) &&
        target?.tagName.toLowerCase() === 'input')
    )
      return;

    const data = getHighestPriorityElements();

    if (data && priority !== data.priority) {
      return;
    } else if (!data || priority !== data?.priority) {
      const scroller: HTMLElement | null = document.querySelector(
        `[data-selectable-scroller='${priority}']`
      );
      if (!scroller) {
        return;
      } else if (ev.key === 'ArrowUp' && scroller.scrollTop > 0) {
        // Scroll up
        scroller.scrollBy({
          top: -scroller.clientHeight / 3,
          behavior: 'smooth',
        });
      } else if (
        ev.key === 'ArrowDown' &&
        scroller.offsetHeight + scroller.scrollTop < scroller.scrollHeight
      ) {
        // Scroll down
        scroller.scrollBy({
          top: scroller.clientHeight / 3,
          behavior: 'smooth',
        });
      }
      return;
    }

    // TODO: Handle input elements
    ev.preventDefault();

    if (ev.key === 'Enter') {
      if (selectedId) {
        props.onSelect?.(selectedId);
      }
      return;
    }

    if (shortcutKeys.includes(ev.key)) {
      const result = data.results.find((a) => a.shortcut === ev.key);
      if (result) {
        setSelectedId(result.id);
        if (updateRouteOnChange) {
          route(updateRouteWithSelectedId(result.id), true);
        }
        props.onSelect?.(result.id);
      }
      return;
    }

    const index = data.results.findIndex((result) => result.id == selectedId);
    let newIndex = ev.key === 'ArrowUp' ? index - 1 : index + 1;
    if (index === -1 && ev.key === 'ArrowUp') {
      newIndex = data.results.length - 1;
    } else if (newIndex < -1) {
      newIndex = -1;
    } else if (newIndex > data.results.length - 1) {
      newIndex = 0;
    }

    setSelectedId(data.results[newIndex]?.id);

    const scroller: HTMLElement | null = document.querySelector(
      `[data-selectable-scroller='${data.priority}']`
    );
    // console.log('scroller', scroller);
    if (!scroller) return;

    if (data.results[newIndex]) {
      scrollIntoView(scroller, data.results[newIndex].element as HTMLElement);
    } else if (ev.key === 'ArrowUp' && scroller.scrollTop > 0) {
      // Scroll up
      scroller.scrollBy({
        top: -scroller.clientHeight,
        behavior: 'smooth',
      });
    } else if (
      ev.key === 'ArrowDown' &&
      scroller.offsetHeight + scroller.scrollTop < scroller.scrollHeight
    ) {
      // Scroll down
      scroller.scrollBy({
        top: scroller.clientHeight,
        behavior: 'smooth',
      });
    }

    props.onChange?.(data.results[newIndex]?.id);
    if (updateRouteOnChange) {
      route(updateRouteWithSelectedId(data.results[newIndex]?.id), true);
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, capture);

    return (): void => {
      document.removeEventListener('keydown', handleKeyPress, capture);
    };
  });

  return { selectedId };
}
