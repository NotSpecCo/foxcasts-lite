import { h } from 'preact';
import { ComponentBaseProps, SelectableProps } from '../../models';
import { ifClass, joinClasses } from '../../utils/classes';
import { SelectableBase } from '../hoc';
import styles from './AppBarListItem.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    icon?: string;
    text: string;
    disabled?: boolean;
  };

export function AppBarListItem(props: Props): h.JSX.Element {
  return (
    <SelectableBase
      {...props.selectable}
      className={joinClasses(
        styles.root,
        ifClass(props.selectable?.selected, styles.selected),
        ifClass(props.disabled, styles.disabled)
      )}
    >
      {props.selectable?.shortcut ? (
        <div className={styles.shortcut}>{props.selectable?.shortcut}</div>
      ) : null}
      <div className={styles.text}>{props.text}</div>
    </SelectableBase>
  );
}
