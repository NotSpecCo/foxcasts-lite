import { h, VNode } from 'preact';
import { SelectablePriority } from '../hooks/useDpad';

type Props = {
  id?: string;
  priority?: SelectablePriority;
};

export function ScrollAnchor({ id, priority }: Props): VNode {
  return (
    <div
      data-selectable-priority={priority || SelectablePriority.Low}
      data-selectable-id={id}
    />
  );
}
