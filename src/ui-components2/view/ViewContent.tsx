import { h, VNode } from 'preact';
import { SelectablePriority } from '../../hooks/useDpad';
import { ComponentBaseProps } from '../../models';
import styles from './ViewContent.module.css';

type Props = ComponentBaseProps & {};

export function ViewContent(props: Props): VNode {
  return (
    <div
      className={styles.root}
      data-selectable-scroller={SelectablePriority.Low}
    >
      {props.children}
    </div>
  );
}
