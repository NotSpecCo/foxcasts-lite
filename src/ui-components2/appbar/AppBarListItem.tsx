import { h } from 'preact';
import { forwardRef } from 'preact/compat';
import { SelectablePriority } from '../../hooks/useDpad';
import { ComponentBaseProps, SelectableProps } from '../../models';
import { ifClass, joinClasses } from '../../utils/classes';
import styles from './AppBarListItem.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    icon?: string;
    text: string;
  };

export const AppBarListItem = forwardRef(
  ({ selected = false, ...props }: Props, ref: any) => {
    return (
      <div
        ref={ref}
        className={joinClasses(styles.root, ifClass(selected, styles.selected))}
        data-selectable-priority={
          props.selectablePriority || SelectablePriority.Low
        }
        data-selectable-id={props.selectableId}
        data-selectable-shortcut={props.selectableShortcut}
      >
        {props.selectableShortcut ? (
          <div className={styles.shortcut}>{props.selectableShortcut}</div>
        ) : null}
        <div className={styles.text}>{props.text}</div>
      </div>
    );
  }
);
