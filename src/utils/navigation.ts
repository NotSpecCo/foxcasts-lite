export function scrollIntoView(
  element: Element,
  behavior: 'smooth' | 'auto' = 'smooth'
): void {
  // This doesn't work on KaiOS 2.x
  // item.ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // So let's try to recreate it
  const rect = element.getBoundingClientRect();
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

export function setSelected<T>(selectableId: string, scroll = true): void {
  const element = document.querySelector(
    `[data-selectable-id="${selectableId}"]`
  );

  if (!element) return;

  element.setAttribute('data-selected', '');
  if (scroll) {
    scrollIntoView(element, 'auto');
  }
}

export function moveCursor(
  elements: Element[],
  direction: 'next' | 'prev',
  scroll = true
): Element | undefined {
  const currentIndex = elements.findIndex((a) =>
    a.hasAttribute('data-selected')
  );
  let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex === -1 && direction === 'prev') {
    newIndex = elements.length - 1;
  } else if (newIndex < -1) {
    newIndex = -1;
  } else if (newIndex > elements.length - 1) {
    newIndex = 0;
  }

  let selectedElement;
  elements.forEach((element, i) => {
    if (i === newIndex) {
      if (scroll) {
        scrollIntoView(element);
      }
      element.setAttribute('data-selected', '');
      selectedElement = element;
    } else {
      element.removeAttribute('data-selected');
    }
  });

  return selectedElement;
}
