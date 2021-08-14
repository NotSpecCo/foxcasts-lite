import { h, VNode } from 'preact';
import { SelectablePriority } from '../hooks/useDpad';
import { ComponentBaseProps } from '../models';
import { joinClasses } from '../utils/classes';
import styles from './SelectableRow.module.css';

type Props = ComponentBaseProps & {
  selectableId: string;
  priority?: SelectablePriority;
};

export function SelectableRow({
  priority = SelectablePriority.Low,
  ...props
}: Props): VNode {
  return (
    <div
      data-selectable-priority={priority}
      data-selectable-id={props.selectableId}
      className={joinClasses(styles.root, props.className)}
    >
      {props.children}
    </div>
  );
}
