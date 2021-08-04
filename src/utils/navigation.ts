import { h, createRef, RefObject } from 'preact';

export type NavItem<T = unknown> = {
  shortcutKey?: string;
  isSelected: boolean;
  ref: RefObject<any>;
  data: T;
};

export function wrapItems<T>(items: T[], assignNumKeys = false): NavItem<T>[] {
  return items.map((item, i) => ({
    shortcutKey: assignNumKeys && i + 1 <= 9 ? `${i + 1}` : undefined,
    isSelected: false,
    ref: createRef(),
    data: item,
  }));
}

export function cursorSelect<T>(items: NavItem<T>[]): NavItem<T> | undefined {
  const item = items.find((a) => a.isSelected);
  return item;
}

export function cursorSelectByKey<T>(
  items: NavItem<T>[],
  shortcutKey: string
): NavItem<T> | undefined {
  const item = items.find((a) => a.shortcutKey === shortcutKey);
  return item;
}

export function moveCursor<T>(
  items: NavItem<T>[],
  direction: 'next' | 'prev'
): NavItem<T>[] {
  const currentIndex = items.findIndex((a) => a.isSelected);
  let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
  if (newIndex < -1) newIndex = -1;
  else if (newIndex > items.length - 1) newIndex = items.length - 1;
  // console.log('new index', newIndex);

  return items.map((item, index) => {
    if (index === newIndex && item.ref) {
      item.ref.current.scrollIntoView(false);
      // This doesn't work on KaiOS
      // item.ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    return {
      ...item,
      isSelected: index === newIndex,
    };
  });
}
