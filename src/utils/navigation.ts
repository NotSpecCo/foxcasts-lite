export function scrollIntoView(
  scrollerElement: HTMLElement,
  element: HTMLElement,
  behavior: 'smooth' | 'auto' = 'smooth'
): void {
  const rect = element.getBoundingClientRect();

  if (rect.top - scrollerElement.offsetTop < 0) {
    scrollerElement.scroll({
      top: scrollerElement.scrollTop + rect.top - scrollerElement.offsetTop,
      behavior,
    });
    return;
  }

  const diff =
    rect.bottom - (scrollerElement.offsetHeight + scrollerElement.offsetTop);

  if (diff > 0) {
    scrollerElement.scroll({ top: scrollerElement.scrollTop + diff, behavior });
  }
}

export function setSelected<T>(selectableId: string, scroll = true): void {
  // const element = document.querySelector(
  //   `[data-selectable-id="${selectableId}"]`
  // );
  // if (!element) return;
  // element.setAttribute('data-selected', '');
  // if (scroll) {
  //   scrollIntoView(element, 'auto');
  // }
}

export function moveCursor(
  elements: Element[],
  direction: 'next' | 'prev',
  scroll = true
): Element | undefined {
  // const currentIndex = elements.findIndex((a) =>
  //   a.hasAttribute('data-selected')
  // );
  // let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
  // if (currentIndex === -1 && direction === 'prev') {
  //   newIndex = elements.length - 1;
  // } else if (newIndex < -1) {
  //   newIndex = -1;
  // } else if (newIndex > elements.length - 1) {
  //   newIndex = 0;
  // }

  // let selectedElement;
  // elements.forEach((element, i) => {
  //   if (i === newIndex) {
  //     if (scroll) {
  //       scrollIntoView(element);
  //     }
  //     element.setAttribute('data-selected', '');
  //     selectedElement = element;
  //   } else {
  //     element.removeAttribute('data-selected');
  //   }
  // });

  // return selectedElement;
  return undefined;
}
