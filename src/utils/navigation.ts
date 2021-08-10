import { h, createRef, RefObject } from 'preact';

export type NavItem<T = unknown> = {
  id: string;
  shortcutKey?: string;
  isSelected: boolean;
  ref: RefObject<any>;
  data: T;
};

export function wrapItems<T>(
  items: T[],
  idKey: keyof T,
  assignNumKeys = false
): NavItem<T>[] {
  return items.map((item, i) => ({
    id: `${item[idKey]}`,
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

export function scrollIntoView(
  ref?: RefObject<HTMLDivElement>,
  behavior: 'smooth' | 'auto' = 'smooth'
): void {
  if (!ref?.current) return;

  // This doesn't work on KaiOS 2.x
  // item.ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // So let's try to recreate it
  const rect = ref.current.getBoundingClientRect();
  const offset = 30;

  if (rect.top < offset) {
    window.scroll({ top: window.scrollY + rect.top - offset, behavior });
    return;
  }

  const diff = rect.top + rect.height + offset - window.innerHeight;
  if (diff > 0) {
    window.scroll({ top: window.scrollY + diff, behavior });
  }
}

export function setSelected<T>(
  items: NavItem<T>[],
  id: string,
  scroll = true
): NavItem<T>[] {
  return items.map((item) => {
    if (scroll && item.id === id && item.ref) {
      scrollIntoView(item.ref, 'auto');
    }

    return {
      ...item,
      isSelected: item.id === id,
    };
  });
}

export function moveCursor<T>(
  items: NavItem<T>[],
  direction: 'next' | 'prev',
  scroll = true
): NavItem<T>[] {
  const currentIndex = items.findIndex((a) => a.isSelected);
  let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex === -1 && direction === 'prev') {
    newIndex = items.length - 1;
  } else if (newIndex < -1) {
    newIndex = -1;
  } else if (newIndex > items.length - 1) {
    newIndex = 0;
  }
  // console.log('new index', newIndex);

  return items.map((item, index) => {
    if (scroll && index === newIndex && item.ref) {
      scrollIntoView(item.ref);
    }

    return {
      ...item,
      isSelected: index === newIndex,
    };
  });
}
