import { h } from 'preact';
import { ComponentBaseProps } from '../models';
import styles from './LabeledRow.module.css';

type Props = ComponentBaseProps & {
  label: string;
  text?: string | null;
};

export function LabeledRow(props: Props): h.JSX.Element {
  return (
    <div className={styles.root}>
      <div className={styles.label}>{props.label}</div>
      <div className={styles.text}>{props.text}</div>
    </div>
  );
}
