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

  // Workaround for KaiOS being based on an old browser
  // TODO: Use scroll-margin on ListItem when available
  const rect = ref.current.getBoundingClientRect();

  if (rect.top < 20) {
    window.scroll({ top: window.scrollY + rect.top - 30, behavior });
  }

  const diff = rect.top + rect.height + 40 - window.innerHeight;
  if (diff > 0) {
    window.scroll({ top: window.scrollY + diff, behavior });
  }

  // This doesn't work on KaiOS 2.x
  // item.ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
  if (newIndex < -1) newIndex = -1;
  else if (newIndex > items.length - 1) newIndex = items.length - 1;
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
