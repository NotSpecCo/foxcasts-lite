import { h } from 'preact';
import { ComponentBaseProps, SelectableProps } from '../models';
import { SelectableBase } from './hoc';
import styles from './SettingsRow.module.css';

type Props = ComponentBaseProps &
  SelectableProps & {
    label: string;
    control: h.JSX.Element;
  };

export function SettingsRow(props: Props): h.JSX.Element {
  return (
    <SelectableBase className={styles.root} {...props.selectable}>
      <div className={styles.label}>{props.label}</div>
      <div className={styles.control}>{props.control}</div>
    </SelectableBase>
  );
}
