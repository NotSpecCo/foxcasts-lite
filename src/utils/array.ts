export function getIndexWrap(
  arr: any[],
  index: number,
  change: 1 | -1
): number {
  let newIndex = index + change;
  if (newIndex < 0) newIndex = arr.length - 1;
  else if (newIndex === arr.length) newIndex = 0;

  return newIndex;
}
